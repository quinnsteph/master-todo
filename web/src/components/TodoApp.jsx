import { useEffect, useState } from 'react';
import TabNavigation from './TabNavigation';
import MasterTodoView from './MasterTodoView';
import DinnerTracker from './DinnerTracker';
import { parseMasterTodo } from '../utils/MasterTodoParser';

export default function TodoApp() {
	const [todos, setTodos] = useState([]);
	const [input, setInput] = useState('');
	const [filter, setFilter] = useState('all');
	const [activeView, setActiveView] = useState('local');
	const [masterSections, setMasterSections] = useState(null);
	const [isLoadingMaster, setIsLoadingMaster] = useState(false);

	useEffect(() => {
		const savedTodos = localStorage.getItem('todos');
		if (savedTodos) {
			setTodos(JSON.parse(savedTodos));
		}
		// Load master TODO file
		loadMasterTodos();
	}, []);

	useEffect(() => {
		localStorage.setItem('todos', JSON.stringify(todos));
	}, [todos]);

	async function loadMasterTodos() {
		setIsLoadingMaster(true);
		try {
			// Try to load from public folder
			const response = await fetch('/MASTER_TODO.md');
			if (response.ok) {
				const content = await response.text();
				const sections = parseMasterTodo(content);
				setMasterSections(sections);
			} else {
				// Fallback to sample data for demo
				setMasterSections({
					todaysFocus: [],
					quickCapture: [],
					projects: {},
					codeTodos: [],
					completed: []
				});
			}
		} catch (error) {
			console.error('Error loading master todos:', error);
			setMasterSections({
				todaysFocus: [],
				quickCapture: [],
				projects: {},
				codeTodos: [],
				completed: []
			});
		} finally {
			setIsLoadingMaster(false);
		}
	}

	function addTodo(e) {
		e.preventDefault();
		if (!input.trim()) return;
		
		const newTodo = {
			id: Date.now().toString(),
			text: input.trim(),
			completed: false,
			createdAt: new Date().toISOString()
		};
		
		setTodos([newTodo, ...todos]);
		setInput('');
	}

	function toggleTodo(id) {
		setTodos(todos.map(todo => 
			todo.id === id ? { ...todo, completed: !todo.completed } : todo
		));
	}

	function deleteTodo(id) {
		setTodos(todos.filter(todo => todo.id !== id));
	}

	function clearCompleted() {
		setTodos(todos.filter(todo => !todo.completed));
	}

	const filteredTodos = todos.filter(todo => {
		if (filter === 'active') return !todo.completed;
		if (filter === 'completed') return todo.completed;
		return true;
	});

	const activeCount = todos.filter(t => !t.completed).length;
	const completedCount = todos.filter(t => t.completed).length;

	// Calculate counts for tabs
	const getCounts = () => {
		// Get dinner balance from localStorage
		const dinnerData = JSON.parse(localStorage.getItem('dinnerData') || '{}');
		let dinnerBalance = 'Balanced';
		if (dinnerData.cooking?.stats) {
			const youCooked = dinnerData.cooking.stats.you?.cooked || 0;
			const wifeCooked = dinnerData.cooking.stats.wife?.cooked || 0;
			const difference = youCooked - wifeCooked;
			if (difference > 0) dinnerBalance = `+${difference}`;
			else if (difference < 0) dinnerBalance = `${difference}`;
		}
		
		if (!masterSections) return { 
			local: todos.length, 
			master: 0, 
			projects: 0, 
			code: 0,
			dinner: 0,
			dinnerBalance
		};
		
		const masterCount = (masterSections.todaysFocus?.length || 0) + 
			(masterSections.quickCapture?.length || 0) + 
			(masterSections.codeTodos?.length || 0);
		
		const projectCount = Object.keys(masterSections.projects || {}).reduce(
			(sum, key) => sum + masterSections.projects[key].length, 0
		);
		
		return {
			local: todos.length,
			master: masterCount,
			projects: projectCount,
			code: masterSections.codeTodos?.length || 0,
			dinner: 0,
			dinnerBalance
		};
	};

	// Render based on active view
	const renderContent = () => {
		if (activeView === 'local') {
			// Original todo view
			return (
				<>
					<form onSubmit={addTodo} style={styles.form}>
					<div style={styles.inputGroup}>
						<input 
							value={input} 
							onChange={(e) => setInput(e.target.value)} 
							placeholder="What needs to be done?" 
							style={styles.input}
							autoFocus
						/>
						<button 
							type="submit" 
							style={{...styles.addButton, ...(input.trim() ? {} : styles.disabledButton)}} 
							disabled={!input.trim()}
						>
							Add Task
						</button>
					</div>
				</form>

				<div style={styles.statsRow}>
					<div style={styles.stat}>
						<div style={styles.statNumber}>{todos.length}</div>
						<div style={styles.statLabel}>Total</div>
					</div>
					<div style={styles.stat}>
						<div style={{...styles.statNumber, color: '#4ade80'}}>{activeCount}</div>
						<div style={styles.statLabel}>Active</div>
					</div>
					<div style={styles.stat}>
						<div style={{...styles.statNumber, color: '#a78bfa'}}>{completedCount}</div>
						<div style={styles.statLabel}>Done</div>
					</div>
				</div>

				<div style={styles.filterGroup}>
					<button 
						onClick={() => setFilter('all')} 
						style={{...styles.filterBtn, ...(filter === 'all' ? styles.filterActive : {})}}
					>
						All Tasks
					</button>
					<button 
						onClick={() => setFilter('active')} 
						style={{...styles.filterBtn, ...(filter === 'active' ? styles.filterActive : {})}}
					>
						Active
					</button>
					<button 
						onClick={() => setFilter('completed')} 
						style={{...styles.filterBtn, ...(filter === 'completed' ? styles.filterActive : {})}}
					>
						Completed
					</button>
				</div>

				<div style={styles.todoContainer}>
					{filteredTodos.length === 0 ? (
						<div style={styles.emptyState}>
							<div style={styles.emptyIcon}>🎯</div>
							<h3 style={styles.emptyTitle}>
								{filter === 'completed' ? 'No completed tasks' : 
								 filter === 'active' ? 'All caught up!' : 
								 'Ready to be productive?'}
							</h3>
							<p style={styles.emptyText}>
								{filter === 'all' && 'Add your first task above to get started'}
								{filter === 'active' && 'All your tasks are completed!'}
								{filter === 'completed' && 'Complete some tasks to see them here'}
							</p>
						</div>
					) : (
						<div style={styles.todoList}>
							{filteredTodos.map((todo) => (
								<div key={todo.id} style={styles.todoCard}>
									<label style={styles.todoContent}>
										<input 
											type="checkbox" 
											checked={todo.completed} 
											onChange={() => toggleTodo(todo.id)}
											style={styles.checkbox}
											className="todo-checkbox"
										/>
										<span style={{
											...styles.todoText, 
											...(todo.completed ? styles.todoCompleted : {})
										}}>
											{todo.text}
										</span>
									</label>
									<button 
										onClick={() => deleteTodo(todo.id)} 
										style={styles.deleteBtn}
										aria-label="Delete"
									>
										✕
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{completedCount > 0 && (
					<button onClick={clearCompleted} style={styles.clearBtn}>
						Clear {completedCount} completed
					</button>
				)}
				</>
			);
		}

		// Dinner view
		if (activeView === 'dinner') {
			return <DinnerTracker />;
		}

		// Master view and other views
		if (masterSections && (activeView === 'master' || activeView === 'projects' || activeView === 'code')) {
			return (
				<MasterTodoView 
					sections={masterSections}
					viewType={activeView}
					onTodoToggle={(id) => {
						// Handle toggle if needed
						console.log('Toggle master todo:', id);
					}}
				/>
			);
		}

		// Loading state
		if (isLoadingMaster) {
			return (
				<div style={styles.loadingContainer}>
					<div style={styles.loadingSpinner}>⏳</div>
					<p>Loading master todos...</p>
				</div>
			);
		}

		return null;
	};

	return (
		<div style={styles.container}>
			{/* Floating orbs for visual effect */}
			<div style={styles.orb1}></div>
			<div style={styles.orb2}></div>
			<div style={styles.orb3}></div>

			<div style={styles.glassCard}>
				<header style={styles.header}>
					<h1 style={styles.title}>✨ Master TODO</h1>
					<p style={styles.subtitle}>Your personal task manager</p>
				</header>

				{/* Tab Navigation */}
				<TabNavigation 
					activeView={activeView}
					onViewChange={setActiveView}
					counts={getCounts()}
				/>

				{/* Content based on active view */}
				{renderContent()}
			</div>

			<footer style={styles.footer}>
				<p>Stored locally • Private & Secure • No login required</p>
			</footer>
		</div>
	);
}

const styles = {
	container: {
		minHeight: '100vh',
		padding: '20px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative'
	},
	orb1: {
		position: 'absolute',
		width: '300px',
		height: '300px',
		background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
		borderRadius: '50%',
		top: '10%',
		left: '10%',
		filter: 'blur(40px)',
		animation: 'float 15s infinite ease-in-out'
	},
	orb2: {
		position: 'absolute',
		width: '200px',
		height: '200px',
		background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
		borderRadius: '50%',
		bottom: '20%',
		right: '15%',
		filter: 'blur(30px)',
		animation: 'float 20s infinite ease-in-out reverse'
	},
	orb3: {
		position: 'absolute',
		width: '250px',
		height: '250px',
		background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
		borderRadius: '50%',
		top: '50%',
		right: '10%',
		filter: 'blur(35px)',
		animation: 'float 18s infinite ease-in-out'
	},
	glassCard: {
		width: '100%',
		maxWidth: '520px',
		background: 'rgba(255, 255, 255, 0.15)',
		backdropFilter: 'blur(20px)',
		WebkitBackdropFilter: 'blur(20px)',
		borderRadius: '24px',
		border: '1px solid rgba(255, 255, 255, 0.3)',
		boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
		overflow: 'hidden',
		position: 'relative',
		zIndex: 10
	},
	header: {
		padding: '32px',
		textAlign: 'center',
		borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
	},
	title: {
		fontSize: '2.2rem',
		fontWeight: '700',
		margin: '0 0 8px 0',
		color: 'white',
		textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
	},
	subtitle: {
		fontSize: '1rem',
		margin: 0,
		color: 'rgba(255, 255, 255, 0.9)',
		fontWeight: '400'
	},
	form: {
		padding: '24px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
	},
	inputGroup: {
		display: 'flex',
		gap: '12px'
	},
	input: {
		flex: 1,
		padding: '14px 18px',
		fontSize: '16px',
		background: 'rgba(255, 255, 255, 0.2)',
		border: '1px solid rgba(255, 255, 255, 0.3)',
		borderRadius: '12px',
		color: 'white',
		outline: 'none',
		transition: 'all 0.3s',
		backdropFilter: 'blur(10px)',
		WebkitBackdropFilter: 'blur(10px)'
	},
	addButton: {
		padding: '14px 28px',
		fontSize: '16px',
		fontWeight: '600',
		background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
		color: 'white',
		border: 'none',
		borderRadius: '12px',
		cursor: 'pointer',
		transition: 'all 0.3s',
		boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
	},
	disabledButton: {
		opacity: 0.5,
		cursor: 'not-allowed'
	},
	statsRow: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		padding: '24px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
		gap: '16px'
	},
	stat: {
		textAlign: 'center'
	},
	statNumber: {
		fontSize: '2rem',
		fontWeight: '700',
		color: 'white',
		lineHeight: 1
	},
	statLabel: {
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.7)',
		marginTop: '4px',
		textTransform: 'uppercase',
		letterSpacing: '1px'
	},
	filterGroup: {
		display: 'flex',
		gap: '8px',
		padding: '16px 24px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
	},
	filterBtn: {
		flex: 1,
		padding: '10px',
		fontSize: '14px',
		fontWeight: '500',
		background: 'rgba(255, 255, 255, 0.1)',
		color: 'rgba(255, 255, 255, 0.8)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '8px',
		cursor: 'pointer',
		transition: 'all 0.3s'
	},
	filterActive: {
		background: 'rgba(102, 126, 234, 0.3)',
		borderColor: 'rgba(102, 126, 234, 0.5)',
		color: 'white'
	},
	todoContainer: {
		minHeight: '200px',
		maxHeight: '400px',
		overflowY: 'auto'
	},
	emptyState: {
		padding: '60px 24px',
		textAlign: 'center'
	},
	emptyIcon: {
		fontSize: '4rem',
		marginBottom: '16px'
	},
	emptyTitle: {
		fontSize: '1.3rem',
		color: 'white',
		margin: '0 0 8px 0',
		fontWeight: '600'
	},
	emptyText: {
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.7)',
		margin: 0
	},
	todoList: {
		padding: '16px'
	},
	todoCard: {
		display: 'flex',
		alignItems: 'center',
		padding: '16px',
		marginBottom: '8px',
		background: 'rgba(255, 255, 255, 0.1)',
		borderRadius: '12px',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		transition: 'all 0.3s'
	},
	todoContent: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		cursor: 'pointer'
	},
	checkbox: {
		marginRight: '14px'
	},
	todoText: {
		fontSize: '16px',
		color: 'white',
		flex: 1
	},
	todoCompleted: {
		opacity: 0.6,
		textDecoration: 'line-through'
	},
	deleteBtn: {
		width: '32px',
		height: '32px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '8px',
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: '18px',
		cursor: 'pointer',
		transition: 'all 0.3s'
	},
	clearBtn: {
		width: '100%',
		padding: '16px',
		fontSize: '15px',
		fontWeight: '500',
		background: 'rgba(255, 255, 255, 0.1)',
		color: 'rgba(255, 255, 255, 0.9)',
		border: 'none',
		borderTop: '1px solid rgba(255, 255, 255, 0.2)',
		cursor: 'pointer',
		transition: 'all 0.3s'
	},
	footer: {
		marginTop: '24px',
		textAlign: 'center',
		color: 'rgba(255, 255, 255, 0.6)',
		fontSize: '13px'
	},
	loadingContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '60px',
		color: 'rgba(255, 255, 255, 0.8)'
	},
	loadingSpinner: {
		fontSize: '48px',
		animation: 'spin 2s linear infinite',
		marginBottom: '16px'
	}
};