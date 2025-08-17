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
					<form onSubmit={addTodo} className="todo-form">
					<div className="todo-input-group">
						<input 
							value={input} 
							onChange={(e) => setInput(e.target.value)} 
							placeholder="What needs to be done?" 
							className="todo-input"
							autoFocus
						/>
						<button 
							type="submit" 
							className="todo-add-button"
							disabled={!input.trim()}
						>
							Add Task
						</button>
					</div>
				</form>

				<div className="todo-stats-row">
					<div className="todo-stat">
						<div className="todo-stat-number">{todos.length}</div>
						<div className="todo-stat-label">Total</div>
					</div>
					<div className="todo-stat">
						<div className="todo-stat-number" style={{color: '#4ade80'}}>{activeCount}</div>
						<div className="todo-stat-label">Active</div>
					</div>
					<div className="todo-stat">
						<div className="todo-stat-number" style={{color: '#a78bfa'}}>{completedCount}</div>
						<div className="todo-stat-label">Done</div>
					</div>
				</div>

				<div className="todo-filter-group">
					<button 
						onClick={() => setFilter('all')} 
						className={`todo-filter-btn ${filter === 'all' ? 'active' : ''}`}
					>
						All Tasks
					</button>
					<button 
						onClick={() => setFilter('active')} 
						className={`todo-filter-btn ${filter === 'active' ? 'active' : ''}`}
					>
						Active
					</button>
					<button 
						onClick={() => setFilter('completed')} 
						className={`todo-filter-btn ${filter === 'completed' ? 'active' : ''}`}
					>
						Completed
					</button>
				</div>

				<div className="todo-container">
					{filteredTodos.length === 0 ? (
						<div className="todo-empty-state">
							<div className="todo-empty-icon">🎯</div>
							<h3 className="todo-empty-title">
								{filter === 'completed' ? 'No completed tasks' : 
								 filter === 'active' ? 'All caught up!' : 
								 'Ready to be productive?'}
							</h3>
							<p className="todo-empty-text">
								{filter === 'all' && 'Add your first task above to get started'}
								{filter === 'active' && 'All your tasks are completed!'}
								{filter === 'completed' && 'Complete some tasks to see them here'}
							</p>
						</div>
					) : (
						<div className="todo-list">
							{filteredTodos.map((todo) => (
								<div key={todo.id} className="todo-card">
									<label className="todo-content">
										<input 
											type="checkbox" 
											checked={todo.completed} 
											onChange={() => toggleTodo(todo.id)}
											className="todo-checkbox"
										/>
										<span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
											{todo.text}
										</span>
									</label>
									<button 
										onClick={() => deleteTodo(todo.id)} 
										className="todo-delete-btn"
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
					<button onClick={clearCompleted} className="todo-clear-btn">
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
				<div className="todo-loading-container">
					<div className="todo-loading-spinner">⏳</div>
					<p>Loading master todos...</p>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="todo-app-container">
			{/* Floating orbs for visual effect */}
			<div className="orb1"></div>
			<div className="orb2"></div>
			<div className="orb3"></div>

			<div className="todo-glass-card">
				<header className="todo-header">
					<h1>✨ Master TODO</h1>
					<p>Your personal task manager</p>
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

			<footer className="todo-footer">
				<p>Stored locally • Private & Secure • No login required</p>
			</footer>
		</div>
	);
}

// Styles have been moved to App.css for better mobile responsiveness