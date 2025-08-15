import { useEffect, useState } from 'react';

export default function TodoApp() {
	const [todos, setTodos] = useState([]);
	const [input, setInput] = useState('');
	const [filter, setFilter] = useState('all'); // all, active, completed

	// Load todos from localStorage on mount
	useEffect(() => {
		const savedTodos = localStorage.getItem('todos');
		if (savedTodos) {
			setTodos(JSON.parse(savedTodos));
		}
	}, []);

	// Save todos to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem('todos', JSON.stringify(todos));
	}, [todos]);

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

	return (
		<div style={styles.container}>
			<header style={styles.header}>
				<h1 style={styles.title}>Master TODO</h1>
				<p style={styles.subtitle}>Simple, fast, private todo management</p>
			</header>

			<form onSubmit={addTodo} style={styles.form}>
				<input 
					value={input} 
					onChange={(e) => setInput(e.target.value)} 
					placeholder="What needs to be done?" 
					style={styles.input}
					autoFocus
				/>
				<button type="submit" style={styles.addButton}>
					Add
				</button>
			</form>

			<div style={styles.filters}>
				<button 
					onClick={() => setFilter('all')} 
					style={{...styles.filterButton, ...(filter === 'all' ? styles.activeFilter : {})}}
				>
					All ({todos.length})
				</button>
				<button 
					onClick={() => setFilter('active')} 
					style={{...styles.filterButton, ...(filter === 'active' ? styles.activeFilter : {})}}
				>
					Active ({activeCount})
				</button>
				<button 
					onClick={() => setFilter('completed')} 
					style={{...styles.filterButton, ...(filter === 'completed' ? styles.activeFilter : {})}}
				>
					Done ({completedCount})
				</button>
			</div>

			<ul style={styles.list}>
				{filteredTodos.length === 0 ? (
					<li style={styles.emptyState}>
						{filter === 'completed' ? 'No completed todos' : 
						 filter === 'active' ? 'No active todos' : 
						 'No todos yet. Add one above!'}
					</li>
				) : (
					filteredTodos.map((todo) => (
						<li key={todo.id} style={styles.todoItem}>
							<label style={styles.todoLabel}>
								<input 
									type="checkbox" 
									checked={todo.completed} 
									onChange={() => toggleTodo(todo.id)}
									style={styles.checkbox}
								/>
								<span style={{
									...styles.todoText, 
									...(todo.completed ? styles.completedText : {})
								}}>
									{todo.text}
								</span>
							</label>
							<button 
								onClick={() => deleteTodo(todo.id)} 
								style={styles.deleteButton}
								aria-label="Delete todo"
							>
								×
							</button>
						</li>
					))
				)}
			</ul>

			{completedCount > 0 && (
				<button onClick={clearCompleted} style={styles.clearButton}>
					Clear completed ({completedCount})
				</button>
			)}

			<footer style={styles.footer}>
				<p style={styles.footerText}>
					Data stored locally • No account needed • 
					<a href="https://github.com/quinnsteph/master-todo" style={styles.link}> GitHub</a>
				</p>
			</footer>
		</div>
	);
}

const styles = {
	container: {
		padding: '20px',
		maxWidth: '600px',
		margin: '0 auto',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
		minHeight: '100vh',
		backgroundColor: '#f5f5f5'
	},
	header: {
		textAlign: 'center',
		marginBottom: '30px'
	},
	title: {
		fontSize: '2.5rem',
		margin: '0 0 10px 0',
		color: '#333',
		fontWeight: '300'
	},
	subtitle: {
		color: '#666',
		fontSize: '0.9rem',
		margin: 0
	},
	form: {
		display: 'flex',
		gap: '10px',
		marginBottom: '20px'
	},
	input: {
		flex: 1,
		padding: '12px 16px',
		fontSize: '16px',
		border: '2px solid #ddd',
		borderRadius: '8px',
		outline: 'none',
		transition: 'border-color 0.2s',
		WebkitAppearance: 'none'
	},
	addButton: {
		padding: '12px 24px',
		fontSize: '16px',
		backgroundColor: '#4CAF50',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		fontWeight: '500',
		transition: 'background-color 0.2s',
		WebkitTapHighlightColor: 'transparent'
	},
	filters: {
		display: 'flex',
		gap: '10px',
		marginBottom: '20px',
		flexWrap: 'wrap'
	},
	filterButton: {
		padding: '8px 16px',
		fontSize: '14px',
		border: '1px solid #ddd',
		borderRadius: '6px',
		backgroundColor: 'white',
		cursor: 'pointer',
		transition: 'all 0.2s',
		WebkitTapHighlightColor: 'transparent'
	},
	activeFilter: {
		backgroundColor: '#007AFF',
		color: 'white',
		borderColor: '#007AFF'
	},
	list: {
		listStyle: 'none',
		padding: 0,
		margin: '0 0 20px 0',
		backgroundColor: 'white',
		borderRadius: '8px',
		boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
	},
	emptyState: {
		padding: '40px 20px',
		textAlign: 'center',
		color: '#999',
		fontSize: '14px'
	},
	todoItem: {
		display: 'flex',
		alignItems: 'center',
		padding: '16px',
		borderBottom: '1px solid #f0f0f0',
		transition: 'background-color 0.2s'
	},
	todoLabel: {
		display: 'flex',
		alignItems: 'center',
		flex: 1,
		cursor: 'pointer',
		userSelect: 'none',
		WebkitUserSelect: 'none'
	},
	checkbox: {
		width: '20px',
		height: '20px',
		marginRight: '12px',
		cursor: 'pointer',
		WebkitAppearance: 'none',
		border: '2px solid #ddd',
		borderRadius: '4px',
		position: 'relative',
		outline: 'none',
		transition: 'all 0.2s'
	},
	todoText: {
		fontSize: '16px',
		color: '#333',
		wordBreak: 'break-word'
	},
	completedText: {
		textDecoration: 'line-through',
		color: '#999'
	},
	deleteButton: {
		width: '32px',
		height: '32px',
		fontSize: '24px',
		color: '#999',
		backgroundColor: 'transparent',
		border: 'none',
		cursor: 'pointer',
		transition: 'color 0.2s',
		WebkitTapHighlightColor: 'transparent'
	},
	clearButton: {
		width: '100%',
		padding: '12px',
		fontSize: '14px',
		color: '#666',
		backgroundColor: 'white',
		border: '1px solid #ddd',
		borderRadius: '8px',
		cursor: 'pointer',
		marginBottom: '20px',
		transition: 'all 0.2s',
		WebkitTapHighlightColor: 'transparent'
	},
	footer: {
		textAlign: 'center',
		paddingTop: '20px',
		borderTop: '1px solid #e0e0e0'
	},
	footerText: {
		fontSize: '12px',
		color: '#999'
	},
	link: {
		color: '#007AFF',
		textDecoration: 'none'
	}
};