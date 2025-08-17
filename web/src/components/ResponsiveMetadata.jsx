import { useState, useEffect } from 'react';
import { getSmartPath, getRelativeTime, getProjectColor } from '../utils/MasterTodoParser';

export default function ResponsiveMetadata({ todo }) {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (!todo.metadata || Object.keys(todo.metadata).length === 0) {
		return null;
	}

	const { file, fileName, lineNumber, source, timestamp, pwd } = todo.metadata;
	const project = todo.project;

	// Mobile view - compact badges
	if (isMobile) {
		return (
			<div style={styles.container}>
				<div style={styles.badgeContainer}>
					{project && (
						<span style={{...styles.badge, background: getProjectColor(project)}}>
							🏷️ {project}
						</span>
					)}
					{fileName && (
						<span style={styles.badge} onClick={() => setShowDetails(!showDetails)}>
							📁 {fileName}{lineNumber ? `:${lineNumber}` : ''}
						</span>
					)}
					{timestamp && (
						<span style={styles.badge}>
							⏰ {getRelativeTime(timestamp)}
						</span>
					)}
					{source && !fileName && (
						<span style={styles.badge}>
							{getSourceIcon(source)} {source}
						</span>
					)}
				</div>
				
				{showDetails && (
					<div style={styles.detailsDrawer}>
						{file && (
							<div style={styles.detailRow}>
								<span style={styles.detailLabel}>File:</span>
								<span style={styles.detailValue}>{file}</span>
								<button 
									style={styles.copyButton}
									onClick={() => navigator.clipboard.writeText(file)}
								>
									📋
								</button>
							</div>
						)}
						{pwd && (
							<div style={styles.detailRow}>
								<span style={styles.detailLabel}>Path:</span>
								<span style={styles.detailValue}>{pwd}</span>
							</div>
						)}
						{timestamp && (
							<div style={styles.detailRow}>
								<span style={styles.detailLabel}>Added:</span>
								<span style={styles.detailValue}>
									{new Date(timestamp).toLocaleString()}
								</span>
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

	// Desktop view - full metadata
	return (
		<div style={styles.desktopContainer}>
			{project && (
				<span style={{...styles.tag, background: getProjectColor(project)}}>
					{project}
				</span>
			)}
			{file && (
				<span style={styles.tag} title={file}>
					📁 {getSmartPath(file, false)}
				</span>
			)}
			{timestamp && (
				<span style={styles.tag}>
					{getRelativeTime(timestamp)}
				</span>
			)}
			{source && (
				<span style={styles.tag}>
					via {source}
				</span>
			)}
		</div>
	);
}

function getSourceIcon(source) {
	const icons = {
		git: '🔀',
		scan: '🔍',
		manual: '✏️',
		clipboard: '📋',
		vscode: '💻',
		cron: '⏰'
	};
	return icons[source] || '📌';
}

const styles = {
	container: {
		marginTop: '8px'
	},
	badgeContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '6px'
	},
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '4px',
		padding: '4px 8px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '12px',
		fontSize: '12px',
		color: 'rgba(255, 255, 255, 0.9)',
		cursor: 'pointer',
		transition: 'all 0.2s',
		whiteSpace: 'nowrap'
	},
	detailsDrawer: {
		marginTop: '12px',
		padding: '12px',
		background: 'rgba(0, 0, 0, 0.3)',
		borderRadius: '8px',
		fontSize: '14px',
		animation: 'slideDown 0.2s ease'
	},
	detailRow: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: '8px',
		gap: '8px'
	},
	detailLabel: {
		fontWeight: '600',
		color: 'rgba(255, 255, 255, 0.7)',
		minWidth: '50px'
	},
	detailValue: {
		flex: 1,
		color: 'rgba(255, 255, 255, 0.9)',
		wordBreak: 'break-all',
		fontSize: '13px'
	},
	copyButton: {
		padding: '4px 8px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '6px',
		cursor: 'pointer',
		fontSize: '12px',
		transition: 'all 0.2s'
	},
	desktopContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '8px',
		marginTop: '8px'
	},
	tag: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '6px',
		padding: '6px 12px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '6px',
		fontSize: '13px',
		color: 'rgba(255, 255, 255, 0.8)',
		transition: 'all 0.2s'
	}
};