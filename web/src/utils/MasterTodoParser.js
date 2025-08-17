// Parser for MASTER_TODO.md file
export function parseMasterTodo(content) {
	const sections = {
		todaysFocus: [],
		quickCapture: [],
		projects: {},
		codeTodos: [],
		completed: []
	};

	if (!content) return sections;

	const lines = content.split('\n');
	let currentSection = null;
	let currentProject = null;

	for (const line of lines) {
		const trimmed = line.trim();
		
		// Skip empty lines and comments
		if (!trimmed || trimmed.startsWith('<!--') || trimmed.startsWith('*Last updated')) {
			continue;
		}

		// Detect section headers
		if (trimmed.includes('TODAY\'S FOCUS') || trimmed.includes('🔥')) {
			currentSection = 'todaysFocus';
			continue;
		}
		if (trimmed.includes('QUICK CAPTURE') || trimmed.includes('📥')) {
			currentSection = 'quickCapture';
			continue;
		}
		if (trimmed.includes('PROJECTS') || trimmed.includes('🏗️')) {
			currentSection = 'projects';
			continue;
		}
		if (trimmed.includes('COLLECTED FROM CODE') || trimmed.includes('🔍')) {
			currentSection = 'codeTodos';
			continue;
		}
		if (trimmed.includes('COMPLETED') || trimmed.includes('✅')) {
			currentSection = 'completed';
			continue;
		}
		if (trimmed.startsWith('## 📂 Scanned:')) {
			currentSection = 'codeTodos';
			const projectMatch = trimmed.match(/Scanned: (.+?) \[/);
			if (projectMatch) {
				currentProject = projectMatch[1];
			}
			continue;
		}

		// Parse TODO items
		if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
			const todo = parseTodoLine(trimmed);
			if (todo) {
				// Add project info if we're in a scanned section
				if (currentProject && currentSection === 'codeTodos') {
					todo.project = currentProject;
				}

				// Add to appropriate section
				if (currentSection === 'todaysFocus') {
					sections.todaysFocus.push(todo);
				} else if (currentSection === 'quickCapture') {
					sections.quickCapture.push(todo);
				} else if (currentSection === 'projects') {
					const project = todo.project || 'Uncategorized';
					if (!sections.projects[project]) {
						sections.projects[project] = [];
					}
					sections.projects[project].push(todo);
				} else if (currentSection === 'codeTodos') {
					sections.codeTodos.push(todo);
				} else if (currentSection === 'completed') {
					sections.completed.push(todo);
				}
			}
		}
	}

	return sections;
}

export function parseTodoLine(line) {
	const isCompleted = line.includes('[x]');
	const parts = line.replace(/^- \[(x| )\] /, '').split(' | ');
	
	if (!parts[0]) return null;

	const todo = {
		id: generateId(),
		text: parts[0].trim(),
		completed: isCompleted,
		metadata: {}
	};

	// Parse metadata from pipe-separated values
	for (let i = 1; i < parts.length; i++) {
		const metaPart = parts[i].trim();
		
		if (metaPart.startsWith('file:')) {
			const filePath = metaPart.substring(5);
			todo.metadata.file = filePath;
			todo.metadata.fileName = extractFileName(filePath);
			todo.metadata.lineNumber = extractLineNumber(filePath);
		} else if (metaPart.startsWith('pwd:')) {
			todo.metadata.pwd = metaPart.substring(4);
			todo.project = extractProjectFromPath(metaPart.substring(4));
		} else if (metaPart.startsWith('project:')) {
			todo.project = metaPart.substring(8);
		} else if (metaPart.startsWith('via:')) {
			todo.metadata.source = metaPart.substring(4);
		} else if (metaPart.startsWith('scanned:')) {
			todo.metadata.scanned = metaPart.substring(8);
			todo.metadata.source = 'scan';
		} else if (metaPart.match(/^\d{4}-\d{2}-\d{2}/)) {
			todo.metadata.timestamp = metaPart;
		}
	}

	return todo;
}

export function extractFileName(filePath) {
	if (!filePath) return null;
	const parts = filePath.split('/');
	const fileWithLine = parts[parts.length - 1];
	return fileWithLine.split(':')[0];
}

export function extractLineNumber(filePath) {
	if (!filePath) return null;
	const match = filePath.match(/:(\d+)$/);
	return match ? match[1] : null;
}

export function extractProjectFromPath(path) {
	if (!path) return null;
	
	// Common project indicators in paths
	const patterns = [
		/\/Documents\/([^\/]+)/,
		/\/Projects\/([^\/]+)/,
		/\/Code\/([^\/]+)/,
		/\/repos\/([^\/]+)/,
		/\/src\/([^\/]+)/,
		/\/([^\/]+)$/  // Last folder as fallback
	];

	for (const pattern of patterns) {
		const match = path.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	return null;
}

export function getRelativeTime(timestamp) {
	if (!timestamp) return '';
	
	try {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now - date;
		
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		
		if (minutes < 1) return 'just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		
		return date.toLocaleDateString();
	} catch {
		return timestamp;
	}
}

export function getSmartPath(fullPath, isMobile) {
	if (!fullPath) return null;
	
	if (isMobile) {
		// On mobile, just show filename and line
		const fileName = extractFileName(fullPath);
		const lineNumber = extractLineNumber(fullPath);
		return lineNumber ? `${fileName}:${lineNumber}` : fileName;
	}
	
	// On desktop, show more context but still abbreviated
	const parts = fullPath.split('/');
	if (parts.length <= 3) {
		return fullPath;
	}
	
	// Show last 3 parts of path
	return '.../' + parts.slice(-3).join('/');
}

export function getProjectColor(projectName) {
	if (!projectName) return 'rgba(102, 126, 234, 0.3)';
	
	// Generate consistent color from project name
	let hash = 0;
	for (let i = 0; i < projectName.length; i++) {
		hash = projectName.charCodeAt(i) + ((hash << 5) - hash);
	}
	
	const hue = Math.abs(hash) % 360;
	return `hsla(${hue}, 70%, 60%, 0.3)`;
}

function generateId() {
	return `master-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function groupTodosByTimeframe(todos) {
	const groups = {
		today: [],
		thisWeek: [],
		older: []
	};
	
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
	
	todos.forEach(todo => {
		if (!todo.metadata?.timestamp) {
			groups.older.push(todo);
			return;
		}
		
		const todoDate = new Date(todo.metadata.timestamp);
		if (todoDate >= today) {
			groups.today.push(todo);
		} else if (todoDate >= weekAgo) {
			groups.thisWeek.push(todo);
		} else {
			groups.older.push(todo);
		}
	});
	
	return groups;
}