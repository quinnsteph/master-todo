import { useState, useEffect } from 'react';

export default function TabNavigation({ activeView, onViewChange, counts = {} }) {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const tabs = [
		{ id: 'local', label: 'My TODOs', icon: '📝', count: counts.local || 0 },
		{ id: 'master', label: 'Master List', icon: '📋', count: counts.master || 0 },
		{ id: 'projects', label: 'Projects', icon: '🏗️', count: counts.projects || 0 },
		{ id: 'code', label: 'Code TODOs', icon: '💻', count: counts.code || 0 },
		{ id: 'dinner', label: 'Dinner', icon: '🍽️', count: counts.dinner || 0, showBadge: counts.dinnerBalance }
	];

	if (isMobile) {
		// Mobile bottom navigation
		return (
			<div style={styles.mobileNav}>
				{tabs.map(tab => (
					<button
						key={tab.id}
						style={{
							...styles.mobileTab,
							...(activeView === tab.id ? styles.mobileTabActive : {})
						}}
						onClick={() => onViewChange(tab.id)}
					>
						<span style={styles.mobileIcon}>{tab.icon}</span>
						<span style={styles.mobileLabel}>{tab.label.split(' ')[0]}</span>
						{tab.showBadge ? (
							<span style={{
								...styles.mobileBadge,
								background: tab.showBadge.includes('+') ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'
							}}>{tab.showBadge}</span>
						) : tab.count > 0 && (
							<span style={styles.mobileBadge}>{tab.count}</span>
						)}
					</button>
				))}
			</div>
		);
	}

	// Desktop tab navigation
	return (
		<div style={styles.desktopNav}>
			{tabs.map(tab => (
				<button
					key={tab.id}
					style={{
						...styles.desktopTab,
						...(activeView === tab.id ? styles.desktopTabActive : {})
					}}
					onClick={() => onViewChange(tab.id)}
				>
					<span>{tab.icon}</span>
					<span>{tab.label}</span>
					{tab.showBadge ? (
						<span style={{
							...styles.badge,
							background: tab.showBadge.includes('+') ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'
						}}>{tab.showBadge}</span>
					) : tab.count > 0 && (
						<span style={styles.badge}>{tab.count}</span>
					)}
				</button>
			))}
		</div>
	);
}

const styles = {
	// Mobile styles
	mobileNav: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		display: 'flex',
		background: 'rgba(0, 0, 0, 0.95)',
		backdropFilter: 'blur(20px)',
		WebkitBackdropFilter: 'blur(20px)',
		borderTop: '1px solid rgba(255, 255, 255, 0.2)',
		zIndex: 1000,
		padding: '8px 0',
		paddingBottom: 'env(safe-area-inset-bottom, 8px)' // iPhone safe area
	},
	mobileTab: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '4px',
		padding: '8px',
		background: 'transparent',
		border: 'none',
		color: 'rgba(255, 255, 255, 0.6)',
		cursor: 'pointer',
		transition: 'all 0.2s',
		position: 'relative',
		minHeight: '56px'
	},
	mobileTabActive: {
		color: 'white',
		background: 'rgba(102, 126, 234, 0.2)'
	},
	mobileIcon: {
		fontSize: '20px',
		lineHeight: 1
	},
	mobileLabel: {
		fontSize: '11px',
		fontWeight: '500'
	},
	mobileBadge: {
		position: 'absolute',
		top: '4px',
		right: '50%',
		transform: 'translateX(16px)',
		background: 'rgba(255, 107, 53, 0.9)',
		color: 'white',
		fontSize: '10px',
		fontWeight: '600',
		padding: '2px 5px',
		borderRadius: '10px',
		minWidth: '18px',
		textAlign: 'center'
	},

	// Desktop styles
	desktopNav: {
		display: 'flex',
		gap: '8px',
		padding: '16px 24px',
		background: 'rgba(255, 255, 255, 0.05)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
		marginBottom: '24px',
		borderRadius: '16px 16px 0 0'
	},
	desktopTab: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		padding: '10px 20px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '12px',
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: '14px',
		fontWeight: '500',
		cursor: 'pointer',
		transition: 'all 0.3s',
		position: 'relative'
	},
	desktopTabActive: {
		background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
		borderColor: 'rgba(102, 126, 234, 0.5)',
		color: 'white',
		transform: 'translateY(-2px)',
		boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
	},
	badge: {
		background: 'rgba(255, 107, 53, 0.9)',
		color: 'white',
		fontSize: '12px',
		fontWeight: '600',
		padding: '2px 8px',
		borderRadius: '12px',
		marginLeft: '4px'
	}
};