import { useState, useEffect } from 'react';
import ResponsiveMetadata from './ResponsiveMetadata';
import { groupTodosByTimeframe, getProjectColor } from '../utils/MasterTodoParser';

export default function MasterTodoView({ sections, viewType, onTodoToggle }) {
	const [expandedSections, setExpandedSections] = useState({
		todaysFocus: true,
		quickCapture: true,
		today: true,
		thisWeek: false,
		older: false
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const toggleSection = (section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	const filterTodos = (todos) => {
		if (!searchQuery) return todos;
		const query = searchQuery.toLowerCase();
		return todos.filter(todo => 
			todo.text.toLowerCase().includes(query) ||
			todo.project?.toLowerCase().includes(query) ||
			todo.metadata?.fileName?.toLowerCase().includes(query)
		);
	};

	const renderTodoItem = (todo) => (
		<div key={todo.id} style={styles.todoItem}>
			<div style={styles.todoMain}>
				<input
					type="checkbox"
					checked={todo.completed}
					onChange={() => onTodoToggle && onTodoToggle(todo.id)}
					style={styles.checkbox}
				/>
				<span style={{
					...styles.todoText,
					...(todo.completed ? styles.completedText : {})
				}}>
					{todo.text}
				</span>
			</div>
			<ResponsiveMetadata todo={todo} />
		</div>
	);

	const renderSection = (title, todos, sectionKey, icon = '📌') => {
		const filteredTodos = filterTodos(todos);
		if (filteredTodos.length === 0 && !searchQuery) return null;

		return (
			<div style={styles.section} key={sectionKey}>
				<button
					style={styles.sectionHeader}
					onClick={() => toggleSection(sectionKey)}
				>
					<span style={styles.sectionTitle}>
						<span style={styles.sectionIcon}>{icon}</span>
						{title}
						<span style={styles.todoCount}>{filteredTodos.length}</span>
					</span>
					<span style={{
						...styles.chevron,
						transform: expandedSections[sectionKey] ? 'rotate(90deg)' : 'rotate(0deg)'
					}}>
						▶
					</span>
				</button>
				{expandedSections[sectionKey] && (
					<div style={styles.sectionContent}>
						{filteredTodos.length === 0 ? (
							<div style={styles.emptyMessage}>
								No matching todos found
							</div>
						) : (
							filteredTodos.map(renderTodoItem)
						)}
					</div>
				)}
			</div>
		);
	};

	const renderProjectView = () => {
		const allProjects = { ...sections.projects };
		
		// Add todos with projects from other sections
		[...sections.todaysFocus, ...sections.quickCapture, ...sections.codeTodos].forEach(todo => {
			if (todo.project) {
				if (!allProjects[todo.project]) {
					allProjects[todo.project] = [];
				}
				if (!allProjects[todo.project].find(t => t.id === todo.id)) {
					allProjects[todo.project].push(todo);
				}
			}
		});

		return Object.entries(allProjects).map(([projectName, todos]) => (
			<div key={projectName} style={styles.projectCard}>
				<div style={{
					...styles.projectHeader,
					background: getProjectColor(projectName)
				}}>
					<h3 style={styles.projectName}>{projectName}</h3>
					<span style={styles.projectCount}>{todos.length} tasks</span>
				</div>
				<div style={styles.projectTodos}>
					{filterTodos(todos).map(renderTodoItem)}
				</div>
			</div>
		));
	};

	const renderTimeGroupedView = () => {
		const allTodos = [
			...sections.todaysFocus,
			...sections.quickCapture,
			...sections.codeTodos
		].filter(todo => !todo.completed);

		const grouped = groupTodosByTimeframe(allTodos);

		return (
			<>
				{renderSection('Today', grouped.today, 'today', '🔥')}
				{renderSection('This Week', grouped.thisWeek, 'thisWeek', '📅')}
				{renderSection('Older', grouped.older, 'older', '📚')}
			</>
		);
	};

	// Main render based on view type
	return (
		<div style={styles.container}>
			{/* Search Bar */}
			<div style={styles.searchContainer}>
				<input
					type="text"
					placeholder={isMobile ? "Search..." : "Search todos, projects, or files..."}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					style={styles.searchInput}
				/>
				{searchQuery && (
					<button
						style={styles.clearSearch}
						onClick={() => setSearchQuery('')}
					>
						✕
					</button>
				)}
			</div>

			{/* Content based on view type */}
			<div style={styles.content}>
				{viewType === 'master' && (
					<>
						{sections.todaysFocus?.length > 0 && 
							renderSection("Today's Focus", sections.todaysFocus, 'todaysFocus', '🔥')}
						{sections.quickCapture?.length > 0 && 
							renderSection('Quick Capture', sections.quickCapture, 'quickCapture', '📥')}
						{isMobile ? renderTimeGroupedView() : (
							<>
								{sections.codeTodos?.length > 0 && 
									renderSection('Code TODOs', sections.codeTodos, 'codeTodos', '💻')}
								{sections.completed?.length > 0 && 
									renderSection('Completed', sections.completed, 'completed', '✅')}
							</>
						)}
					</>
				)}

				{viewType === 'projects' && (
					<div style={styles.projectGrid}>
						{renderProjectView()}
					</div>
				)}

				{viewType === 'code' && (
					renderSection('Code TODOs', sections.codeTodos || [], 'codeTodos', '💻')
				)}
			</div>
		</div>
	);
}

const styles = {
	container: {
		padding: '20px',
		paddingBottom: '80px' // Space for mobile nav
	},
	searchContainer: {
		position: 'relative',
		marginBottom: '24px'
	},
	searchInput: {
		width: '100%',
		padding: '14px 40px 14px 16px',
		fontSize: '16px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '12px',
		color: 'white',
		outline: 'none',
		transition: 'all 0.3s'
	},
	clearSearch: {
		position: 'absolute',
		right: '12px',
		top: '50%',
		transform: 'translateY(-50%)',
		background: 'rgba(255, 255, 255, 0.2)',
		border: 'none',
		borderRadius: '50%',
		width: '24px',
		height: '24px',
		color: 'white',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	content: {
		display: 'flex',
		flexDirection: 'column',
		gap: '16px'
	},
	section: {
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '12px',
		overflow: 'hidden',
		border: '1px solid rgba(255, 255, 255, 0.1)'
	},
	sectionHeader: {
		width: '100%',
		padding: '16px',
		background: 'transparent',
		border: 'none',
		color: 'white',
		cursor: 'pointer',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		transition: 'all 0.2s'
	},
	sectionTitle: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
		fontSize: '16px',
		fontWeight: '600'
	},
	sectionIcon: {
		fontSize: '20px'
	},
	todoCount: {
		background: 'rgba(255, 255, 255, 0.2)',
		padding: '2px 8px',
		borderRadius: '12px',
		fontSize: '12px',
		fontWeight: '500'
	},
	chevron: {
		fontSize: '12px',
		transition: 'transform 0.2s'
	},
	sectionContent: {
		padding: '0 16px 16px',
		animation: 'slideDown 0.2s ease'
	},
	todoItem: {
		padding: '12px',
		marginBottom: '8px',
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '8px',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		transition: 'all 0.2s'
	},
	todoMain: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px'
	},
	checkbox: {
		width: '20px',
		height: '20px',
		cursor: 'pointer'
	},
	todoText: {
		flex: 1,
		fontSize: '15px',
		color: 'white',
		lineHeight: '1.5'
	},
	completedText: {
		opacity: 0.6,
		textDecoration: 'line-through'
	},
	emptyMessage: {
		padding: '24px',
		textAlign: 'center',
		color: 'rgba(255, 255, 255, 0.5)',
		fontSize: '14px'
	},
	projectGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
		gap: '16px'
	},
	projectCard: {
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '12px',
		overflow: 'hidden',
		border: '1px solid rgba(255, 255, 255, 0.1)'
	},
	projectHeader: {
		padding: '16px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	projectName: {
		margin: 0,
		fontSize: '18px',
		fontWeight: '600',
		color: 'white'
	},
	projectCount: {
		fontSize: '12px',
		color: 'rgba(255, 255, 255, 0.8)',
		background: 'rgba(0, 0, 0, 0.3)',
		padding: '4px 8px',
		borderRadius: '8px'
	},
	projectTodos: {
		padding: '16px'
	}
};