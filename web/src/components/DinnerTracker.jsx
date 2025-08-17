import { useState, useEffect } from 'react';

export default function DinnerTracker() {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [dinnerData, setDinnerData] = useState({
		cooking: {
			currentWeek: {},
			history: [],
			stats: {
				you: { assigned: 0, cooked: 0, skipped: 0, reasons: {} },
				wife: { assigned: 0, cooked: 0, skipped: 0, reasons: {} }
			}
		},
		takeaway: {
			orders: [],
			stats: {
				totalOrders: 0,
				youIncluded: 0,
				wifeIncluded: 0,
				kidsIncluded: 0,
				exclusionRate: { you: 0, wife: 0, kids: 0 }
			}
		}
	});

	const [showReasonModal, setShowReasonModal] = useState(false);
	const [selectedDay, setSelectedDay] = useState(null);
	const [customReason, setCustomReason] = useState('');
	const [selectedReason, setSelectedReason] = useState('');
	const [showTakeawayForm, setShowTakeawayForm] = useState(false);
	const [takeawayForm, setTakeawayForm] = useState({
		orderedBy: 'wife',
		recipients: [],
		restaurant: '',
		cost: ''
	});

	const commonReasons = [
		"Working late",
		"Not feeling well",
		"Kids activities",
		"Out with friends",
		"Too tired",
		"Just didn't feel like it",
		"Other"
	];

	// Load data from localStorage and handle resize
	useEffect(() => {
		const saved = localStorage.getItem('dinnerData');
		if (saved) {
			setDinnerData(JSON.parse(saved));
		} else {
			// Initialize current week
			initializeCurrentWeek();
		}
		
		// Handle window resize
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Save to localStorage whenever data changes
	useEffect(() => {
		localStorage.setItem('dinnerData', JSON.stringify(dinnerData));
	}, [dinnerData]);

	function initializeCurrentWeek() {
		const today = new Date();
		const currentWeekData = {};
		
		// Find Tuesday and Thursday of current week
		const dayOfWeek = today.getDay();
		const tuesday = new Date(today);
		tuesday.setDate(today.getDate() - dayOfWeek + 2);
		
		const thursday = new Date(today);
		thursday.setDate(today.getDate() - dayOfWeek + 4);
		
		currentWeekData.tuesday = {
			date: tuesday.toISOString().split('T')[0],
			assigned: 'wife',
			actual: null,
			reason: null,
			customReason: null
		};
		
		currentWeekData.thursday = {
			date: thursday.toISOString().split('T')[0],
			assigned: 'you',
			actual: null,
			reason: null,
			customReason: null
		};
		
		setDinnerData(prev => ({
			...prev,
			cooking: {
				...prev.cooking,
				currentWeek: currentWeekData
			}
		}));
	}

	function updateCooking(day, actual) {
		setDinnerData(prev => {
			const newData = { ...prev };
			const dayData = newData.cooking.currentWeek[day];
			dayData.actual = actual;
			
			// Update stats
			if (actual === 'you' || actual === 'wife') {
				newData.cooking.stats[actual].cooked++;
			}
			
			// If someone didn't cook when assigned, show reason modal
			if (dayData.assigned !== actual && actual !== null) {
				if (actual === 'nobody') {
					setSelectedDay(day);
					setShowReasonModal(true);
				}
			}
			
			return newData;
		});
	}

	function saveReason() {
		if (!selectedReason && !customReason) return;
		
		setDinnerData(prev => {
			const newData = { ...prev };
			const dayData = newData.cooking.currentWeek[selectedDay];
			const assigned = dayData.assigned;
			
			dayData.reason = selectedReason === 'Other' ? customReason : selectedReason;
			dayData.customReason = selectedReason === 'Other' ? customReason : null;
			
			// Update stats
			newData.cooking.stats[assigned].skipped++;
			const reasonText = selectedReason === 'Other' ? customReason : selectedReason;
			if (!newData.cooking.stats[assigned].reasons[reasonText]) {
				newData.cooking.stats[assigned].reasons[reasonText] = 0;
			}
			newData.cooking.stats[assigned].reasons[reasonText]++;
			
			return newData;
		});
		
		setShowReasonModal(false);
		setSelectedReason('');
		setCustomReason('');
	}

	function addTakeawayOrder() {
		const newOrder = {
			id: Date.now().toString(),
			date: new Date().toISOString(),
			...takeawayForm,
			cost: parseFloat(takeawayForm.cost) || 0
		};
		
		setDinnerData(prev => {
			const newData = { ...prev };
			newData.takeaway.orders.unshift(newOrder);
			
			// Update stats
			newData.takeaway.stats.totalOrders++;
			if (takeawayForm.recipients.includes('you')) newData.takeaway.stats.youIncluded++;
			if (takeawayForm.recipients.includes('wife')) newData.takeaway.stats.wifeIncluded++;
			if (takeawayForm.recipients.includes('kids')) newData.takeaway.stats.kidsIncluded++;
			
			// Calculate exclusion rates
			const total = newData.takeaway.stats.totalOrders;
			newData.takeaway.stats.exclusionRate.you = ((total - newData.takeaway.stats.youIncluded) / total * 100).toFixed(1);
			newData.takeaway.stats.exclusionRate.wife = ((total - newData.takeaway.stats.wifeIncluded) / total * 100).toFixed(1);
			newData.takeaway.stats.exclusionRate.kids = ((total - newData.takeaway.stats.kidsIncluded) / total * 100).toFixed(1);
			
			return newData;
		});
		
		setShowTakeawayForm(false);
		setTakeawayForm({ orderedBy: 'wife', recipients: [], restaurant: '', cost: '' });
	}

	function getCookingBalance() {
		const youCooked = dinnerData.cooking.stats.you.cooked;
		const wifeCooked = dinnerData.cooking.stats.wife.cooked;
		const difference = youCooked - wifeCooked;
		
		if (difference > 0) return `You +${difference}`;
		if (difference < 0) return `Wife +${Math.abs(difference)}`;
		return 'Balanced';
	}

	function getBalanceColor() {
		const youCooked = dinnerData.cooking.stats.you.cooked;
		const wifeCooked = dinnerData.cooking.stats.wife.cooked;
		const difference = Math.abs(youCooked - wifeCooked);
		
		if (difference === 0) return '#10b981'; // green
		if (difference <= 3) return '#f59e0b'; // yellow
		return '#ef4444'; // red
	}

	return (
		<div style={{
			...styles.container,
			...(isMobile ? styles.mobileContainer : {})
		}} className="dinner-mobile-container">
			{/* Header */}
			<div style={styles.header}>
				<h2 style={styles.title}>🍽️ Dinner Tracking</h2>
				<div style={styles.balance}>
					<span style={{ ...styles.balanceText, color: getBalanceColor() }}>
						{getCookingBalance()}
					</span>
				</div>
			</div>

			{/* Current Week Section */}
			<div style={styles.section}>
				<h3 style={styles.sectionTitle}>This Week's Schedule</h3>
				
				{['tuesday', 'thursday'].map(day => {
					const dayData = dinnerData.cooking.currentWeek[day];
					if (!dayData) return null;
					
					return (
						<div key={day} style={styles.dayCard}>
							<div style={styles.dayHeader}>
								<span style={styles.dayName}>
									{day.charAt(0).toUpperCase() + day.slice(1)}
								</span>
								<span style={styles.date}>{dayData.date}</span>
							</div>
							
							<div style={styles.assignment}>
								<span style={styles.label}>Assigned:</span>
								<span style={styles.assignedPerson}>
									{dayData.assigned === 'you' ? '👤 You' : '👩 Wife'}
								</span>
							</div>
							
							<div style={styles.actualSection}>
								<span style={styles.label}>Who cooked?</span>
								<div style={styles.buttonGroup}>
									<button
										style={{
											...styles.optionBtn,
											...(dayData.actual === 'you' ? styles.selected : {})
										}}
										onClick={() => updateCooking(day, 'you')}
									>
										You
									</button>
									<button
										style={{
											...styles.optionBtn,
											...(dayData.actual === 'wife' ? styles.selected : {})
										}}
										onClick={() => updateCooking(day, 'wife')}
									>
										Wife
									</button>
									<button
										style={{
											...styles.optionBtn,
											...(dayData.actual === 'nobody' ? styles.selectedNobody : {})
										}}
										onClick={() => updateCooking(day, 'nobody')}
									>
										Nobody
									</button>
								</div>
							</div>
							
							{dayData.reason && (
								<div style={styles.reasonDisplay}>
									<span style={styles.reasonLabel}>Reason:</span>
									<span style={styles.reasonText}>{dayData.reason}</span>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Takeaway Section */}
			<div style={styles.section}>
				<div style={styles.sectionHeader}>
					<h3 style={styles.sectionTitle}>Takeaway Orders</h3>
					<button 
						style={styles.addBtn}
						onClick={() => setShowTakeawayForm(true)}
					>
						+ Add Order
					</button>
				</div>
				
				{dinnerData.takeaway.orders.slice(0, 3).map(order => (
					<div key={order.id} style={styles.takeawayCard}>
						<div style={styles.takeawayHeader}>
							<span>{new Date(order.date).toLocaleDateString()}</span>
							<span style={styles.restaurant}>{order.restaurant}</span>
						</div>
						<div style={styles.takeawayDetails}>
							<span>Ordered by: {order.orderedBy === 'you' ? 'You' : 'Wife'}</span>
							<span>For: {order.recipients.join(', ')}</span>
							{order.cost > 0 && <span>${order.cost}</span>}
						</div>
						{!order.recipients.includes('you') && order.orderedBy === 'wife' && (
							<div style={styles.excludedAlert}>⚠️ You were excluded</div>
						)}
					</div>
				))}
			</div>

			{/* Statistics */}
			<div style={styles.section}>
				<h3 style={styles.sectionTitle}>Statistics</h3>
				
				<div style={styles.statsGrid}>
					<div style={styles.statCard}>
						<div style={styles.statTitle}>Cooking Stats</div>
						<div style={styles.statRow}>
							<span>You cooked:</span>
							<span style={styles.statValue}>{dinnerData.cooking.stats.you.cooked}</span>
						</div>
						<div style={styles.statRow}>
							<span>Wife cooked:</span>
							<span style={styles.statValue}>{dinnerData.cooking.stats.wife.cooked}</span>
						</div>
					</div>
					
					<div style={styles.statCard}>
						<div style={styles.statTitle}>Takeaway Inclusion</div>
						<div style={styles.statRow}>
							<span>Your exclusion rate:</span>
							<span style={{
								...styles.statValue,
								color: dinnerData.takeaway.stats.exclusionRate.you > 30 ? '#ef4444' : '#10b981'
							}}>
								{dinnerData.takeaway.stats.exclusionRate.you}%
							</span>
						</div>
						<div style={styles.statRow}>
							<span>Total orders:</span>
							<span style={styles.statValue}>{dinnerData.takeaway.stats.totalOrders}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Reason Modal */}
			{showReasonModal && (
				<div style={styles.modal}>
					<div style={styles.modalContent}>
						<h3 style={styles.modalTitle}>Why didn't they cook?</h3>
						
						{commonReasons.map(reason => (
							<button
								key={reason}
								style={{
									...styles.reasonBtn,
									...(selectedReason === reason ? styles.reasonSelected : {})
								}}
								onClick={() => setSelectedReason(reason)}
							>
								{reason}
							</button>
						))}
						
						{selectedReason === 'Other' && (
							<input
								type="text"
								placeholder="Enter custom reason..."
								value={customReason}
								onChange={(e) => setCustomReason(e.target.value)}
								style={styles.customInput}
								autoFocus
							/>
						)}
						
						<div style={styles.modalButtons}>
							<button 
								style={styles.cancelBtn}
								onClick={() => {
									setShowReasonModal(false);
									setSelectedReason('');
									setCustomReason('');
								}}
							>
								Cancel
							</button>
							<button 
								style={styles.saveBtn}
								onClick={saveReason}
								disabled={!selectedReason || (selectedReason === 'Other' && !customReason)}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Takeaway Form Modal */}
			{showTakeawayForm && (
				<div style={styles.modal}>
					<div style={styles.modalContent}>
						<h3 style={styles.modalTitle}>Add Takeaway Order</h3>
						
						<div style={styles.formGroup}>
							<label style={styles.formLabel}>Who ordered?</label>
							<div style={styles.radioGroup}>
								<label style={styles.radioLabel}>
									<input
										type="radio"
										checked={takeawayForm.orderedBy === 'you'}
										onChange={() => setTakeawayForm(prev => ({ ...prev, orderedBy: 'you' }))}
									/>
									You
								</label>
								<label style={styles.radioLabel}>
									<input
										type="radio"
										checked={takeawayForm.orderedBy === 'wife'}
										onChange={() => setTakeawayForm(prev => ({ ...prev, orderedBy: 'wife' }))}
									/>
									Wife
								</label>
							</div>
						</div>
						
						<div style={styles.formGroup}>
							<label style={styles.formLabel}>Who got food?</label>
							<div style={styles.checkGroup}>
								{['you', 'wife', 'kids'].map(person => (
									<label key={person} style={styles.checkLabel}>
										<input
											type="checkbox"
											checked={takeawayForm.recipients.includes(person)}
											onChange={(e) => {
												if (e.target.checked) {
													setTakeawayForm(prev => ({
														...prev,
														recipients: [...prev.recipients, person]
													}));
												} else {
													setTakeawayForm(prev => ({
														...prev,
														recipients: prev.recipients.filter(r => r !== person)
													}));
												}
											}}
										/>
										{person.charAt(0).toUpperCase() + person.slice(1)}
									</label>
								))}
							</div>
						</div>
						
						<div style={styles.formGroup}>
							<label style={styles.formLabel}>Restaurant</label>
							<input
								type="text"
								value={takeawayForm.restaurant}
								onChange={(e) => setTakeawayForm(prev => ({ ...prev, restaurant: e.target.value }))}
								style={styles.textInput}
								placeholder="e.g., Pizza Place"
							/>
						</div>
						
						<div style={styles.formGroup}>
							<label style={styles.formLabel}>Cost (optional)</label>
							<input
								type="number"
								value={takeawayForm.cost}
								onChange={(e) => setTakeawayForm(prev => ({ ...prev, cost: e.target.value }))}
								style={styles.textInput}
								placeholder="$0.00"
							/>
						</div>
						
						<div style={styles.modalButtons}>
							<button 
								style={styles.cancelBtn}
								onClick={() => {
									setShowTakeawayForm(false);
									setTakeawayForm({ orderedBy: 'wife', recipients: [], restaurant: '', cost: '' });
								}}
							>
								Cancel
							</button>
							<button 
								style={styles.saveBtn}
								onClick={addTakeawayOrder}
								disabled={takeawayForm.recipients.length === 0 || !takeawayForm.restaurant}
							>
								Add Order
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const styles = {
	container: {
		padding: '20px',
		maxHeight: '600px',
		overflowY: 'auto',
		paddingBottom: '100px'
	},
	mobileContainer: {
		padding: '12px',
		maxHeight: 'calc(100vh - 200px)'
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '24px'
	},
	title: {
		fontSize: '1.5rem',
		fontWeight: '600',
		color: 'white',
		margin: 0
	},
	balance: {
		padding: '8px 16px',
		background: 'rgba(255, 255, 255, 0.1)',
		borderRadius: '20px',
		border: '1px solid rgba(255, 255, 255, 0.2)'
	},
	balanceText: {
		fontSize: '14px',
		fontWeight: '600'
	},
	section: {
		marginBottom: '32px'
	},
	sectionHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '16px'
	},
	sectionTitle: {
		fontSize: '1.1rem',
		fontWeight: '600',
		color: 'rgba(255, 255, 255, 0.9)',
		marginBottom: '16px'
	},
	dayCard: {
		background: 'rgba(255, 255, 255, 0.1)',
		borderRadius: '12px',
		padding: '16px',
		marginBottom: '12px',
		border: '1px solid rgba(255, 255, 255, 0.2)'
	},
	dayHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: '12px'
	},
	dayName: {
		fontSize: '1rem',
		fontWeight: '600',
		color: 'white'
	},
	date: {
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	assignment: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: '12px',
		padding: '8px',
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '8px'
	},
	label: {
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.7)'
	},
	assignedPerson: {
		fontWeight: '500',
		color: 'white'
	},
	actualSection: {
		marginTop: '12px'
	},
	buttonGroup: {
		display: 'flex',
		gap: '8px',
		marginTop: '8px',
		flexWrap: 'wrap'
	},
	optionBtn: {
		flex: 1,
		padding: '10px',
		minHeight: '44px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '8px',
		color: 'rgba(255, 255, 255, 0.8)',
		cursor: 'pointer',
		transition: 'all 0.2s',
		fontSize: '14px',
		minWidth: '80px'
	},
	selected: {
		background: 'rgba(102, 126, 234, 0.3)',
		borderColor: 'rgba(102, 126, 234, 0.5)',
		color: 'white'
	},
	selectedNobody: {
		background: 'rgba(239, 68, 68, 0.3)',
		borderColor: 'rgba(239, 68, 68, 0.5)',
		color: 'white'
	},
	reasonDisplay: {
		marginTop: '12px',
		padding: '8px',
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '8px'
	},
	reasonLabel: {
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginRight: '8px'
	},
	reasonText: {
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.9)'
	},
	addBtn: {
		padding: '10px 16px',
		minHeight: '40px',
		background: 'rgba(102, 126, 234, 0.3)',
		border: '1px solid rgba(102, 126, 234, 0.5)',
		borderRadius: '8px',
		color: 'white',
		cursor: 'pointer',
		fontSize: '0.9rem',
		whiteSpace: 'nowrap'
	},
	takeawayCard: {
		background: 'rgba(255, 255, 255, 0.1)',
		borderRadius: '12px',
		padding: '12px',
		marginBottom: '8px',
		border: '1px solid rgba(255, 255, 255, 0.2)'
	},
	takeawayHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: '8px'
	},
	restaurant: {
		fontWeight: '500',
		color: 'rgba(255, 255, 255, 0.9)'
	},
	takeawayDetails: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '8px',
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.7)'
	},
	excludedAlert: {
		marginTop: '8px',
		padding: '4px 8px',
		background: 'rgba(239, 68, 68, 0.2)',
		borderRadius: '6px',
		color: '#f87171',
		fontSize: '0.85rem'
	},
	statsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
		gap: '12px'
	},
	statCard: {
		background: 'rgba(255, 255, 255, 0.1)',
		borderRadius: '12px',
		padding: '16px',
		border: '1px solid rgba(255, 255, 255, 0.2)'
	},
	statTitle: {
		fontSize: '1rem',
		fontWeight: '600',
		color: 'white',
		marginBottom: '12px'
	},
	statRow: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: '8px',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.8)'
	},
	statValue: {
		fontWeight: '600',
		color: 'white'
	},
	modal: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'rgba(0, 0, 0, 0.8)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1000
	},
	modalContent: {
		background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
		backdropFilter: 'blur(20px)',
		WebkitBackdropFilter: 'blur(20px)',
		borderRadius: '16px',
		padding: '20px',
		maxWidth: '400px',
		width: '90%',
		maxHeight: '80vh',
		overflowY: 'auto',
		border: '1px solid rgba(255, 255, 255, 0.2)'
	},
	modalTitle: {
		fontSize: '1.2rem',
		fontWeight: '600',
		color: 'white',
		marginBottom: '20px'
	},
	reasonBtn: {
		display: 'block',
		width: '100%',
		padding: '14px',
		minHeight: '48px',
		marginBottom: '8px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '8px',
		color: 'rgba(255, 255, 255, 0.8)',
		cursor: 'pointer',
		textAlign: 'left',
		transition: 'all 0.2s',
		fontSize: '15px'
	},
	reasonSelected: {
		background: 'rgba(102, 126, 234, 0.3)',
		borderColor: 'rgba(102, 126, 234, 0.5)',
		color: 'white'
	},
	customInput: {
		width: '100%',
		padding: '12px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '8px',
		color: 'white',
		fontSize: '16px',
		marginTop: '8px',
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none'
	},
	modalButtons: {
		display: 'flex',
		gap: '12px',
		marginTop: '20px'
	},
	cancelBtn: {
		flex: 1,
		padding: '12px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '8px',
		color: 'rgba(255, 255, 255, 0.8)',
		cursor: 'pointer'
	},
	saveBtn: {
		flex: 1,
		padding: '12px',
		background: 'rgba(102, 126, 234, 0.3)',
		border: '1px solid rgba(102, 126, 234, 0.5)',
		borderRadius: '8px',
		color: 'white',
		cursor: 'pointer'
	},
	formGroup: {
		marginBottom: '16px'
	},
	formLabel: {
		display: 'block',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.8)',
		marginBottom: '8px'
	},
	radioGroup: {
		display: 'flex',
		gap: '16px'
	},
	radioLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		color: 'rgba(255, 255, 255, 0.9)',
		cursor: 'pointer'
	},
	checkGroup: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px'
	},
	checkLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		color: 'rgba(255, 255, 255, 0.9)',
		cursor: 'pointer'
	},
	textInput: {
		width: '100%',
		padding: '12px',
		background: 'rgba(255, 255, 255, 0.1)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '8px',
		color: 'white',
		fontSize: '16px',
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none'
	}
};