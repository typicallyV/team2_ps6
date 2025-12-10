import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MOOD_HISTORY_KEY = "elderease_mood_history";

export default function MoodTrackerPage() {
	const navigate = useNavigate();
	const [selectedMood, setSelectedMood] = useState(null);
	const [selectedTags, setSelectedTags] = useState([]);
	const [notes, setNotes] = useState("");
	const [moodLogs, setMoodLogs] = useState([]);

	// Warm, accessible palette — sage present but used sparingly
	const colors = {
		sage: "#DCE4C9",    // accent only
		beige: "#F5F5DC",   // primary surface
		taupe: "#B6A28E",   // headings / text accents
		orange: "#E07B39",  // action / primary buttons
		lightNeutral: "#F6F3EC",
		cardBg: "#FFFFFF",
	};

	// Mood colors: darker, theme-aligned so bars are visible against light backgrounds
	const moods = [
		{ id: 1, emoji: "😭", label: "Very Sad", color: colors.taupe },       // taupe (visible)
		{ id: 2, emoji: "😢", label: "Sad", color: "#CFC2AE" },               // warm neutral
		{ id: 3, emoji: "😐", label: "Neutral", color: "#E8DFD6" },           // gentle neutral
		{ id: 4, emoji: "😊", label: "Good", color: colors.orange },         // orange (visible)
		{ id: 5, emoji: "😁", label: "Very Happy", color: "#D47A1F" },       // darker orange
	];

	const tags = [
		"Annoyed","Anxious","Bored","Calm","Excited","Grateful",
		"Happy","Indifferent","Lonely","Productive","Sad","Stressed","Tired"
	];

	// Load mood history from localStorage on mount
	useEffect(() => {
		const loadMoodHistory = () => {
			const stored = localStorage.getItem(MOOD_HISTORY_KEY);
			if (stored) {
				try {
					setMoodLogs(JSON.parse(stored));
				} catch (e) {
					console.error("Error loading mood history:", e);
				}
			}
		};

		loadMoodHistory();
		
		// Listen for mood updates from Dashboard
		window.addEventListener("moodUpdated", loadMoodHistory);
		return () => window.removeEventListener("moodUpdated", loadMoodHistory);
	}, []);

	const toggleTag = (tag) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const handleAddMood = () => {
		if (!selectedMood) return;

		const newLog = {
			id: Date.now(),
			mood: moods.find((m) => m.id === selectedMood),
			tags: selectedTags,
			notes,
			timestamp: new Date().toLocaleString(),
		};

		const updated = [newLog, ...moodLogs];
		setMoodLogs(updated);
		localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updated));
		window.dispatchEvent(new Event("moodUpdated"));

		// reset UI
		setSelectedMood(null);
		setSelectedTags([]);
		setNotes("");
	};

	const handleDeleteMood = (id) => {
		const updated = moodLogs.filter((log) => log.id !== id);
		setMoodLogs(updated);
		localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updated));
		window.dispatchEvent(new Event("moodUpdated"));
	};

	// Calculate mood trends
	const getMoodStats = () => {
		const stats = {};
		moods.forEach((m) => {
			stats[m.label] = 0;
		});
		moodLogs.forEach((log) => {
			if (log.mood && log.mood.label) {
				stats[log.mood.label] = (stats[log.mood.label] || 0) + 1;
			}
		});
		return stats;
	};

	const moodStats = getMoodStats();
	const totalMoods = moodLogs.length;
	const mostCommonMood = totalMoods > 0 
		? Object.entries(moodStats).reduce((a, b) => b[1] > a[1] ? b : a)[0]
		: "None";

	return (
		<div
			style={{
				minHeight: "100vh",
				background: colors.beige,
				padding: "30px",
			}}
		>
			<h1 style={{ fontSize: "32px", marginBottom: "20px", color: colors.taupe }}>
				Log Mood
			</h1>

			{/* Mood Rating */}
			<h2 style={{ marginBottom: "10px", color: colors.taupe }}>Mood Rating</h2>

			<div
				style={{
					display: "flex",
					gap: "15px",
					marginBottom: "25px",
				}}
			>
				{moods.map((m) => (
					<div
						key={m.id}
						onClick={() => setSelectedMood(m.id)}
						style={{
							flex: 1,
							padding: "20px",
							background: selectedMood === m.id ? colors.taupe : m.color,
							textAlign: "center",
							borderRadius: "15px",
							cursor: "pointer",
							fontSize: "40px",
							color: selectedMood === m.id ? "white" : "#333",
							border:
								selectedMood === m.id
									? `3px solid ${colors.orange}`
									: `2px solid ${colors.taupe}`,
						}}
					>
						<div>{m.emoji}</div>
						<div style={{ fontSize: "18px", marginTop: "8px" }}>{m.label}</div>
					</div>
				))}
			</div>

			{/* Tags */}
			<h2 style={{ marginBottom: "10px", color: colors.taupe }}>Tags</h2>

			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "10px",
					marginBottom: "25px",
				}}
			>
				{tags.map((tag) => (
					<div
						key={tag}
						onClick={() => toggleTag(tag)}
						style={{
							padding: "10px 18px",
							borderRadius: "20px",
							fontSize: "16px",
							background: selectedTags.includes(tag) ? colors.orange : "#F7F4EE",
							cursor: "pointer",
							border: `1px solid ${colors.taupe}`,
							color: selectedTags.includes(tag) ? "white" : "#333",
						}}
					>
						{tag}
					</div>
				))}
			</div>

			{/* Notes */}
			<div style={{ marginBottom: "25px" }}>
				<h2 style={{ color: colors.taupe }}>Add Notes</h2>

				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Type notes here..."
					style={{
						width: "100%",
						minHeight: "80px",
						padding: "12px",
						fontSize: "16px",
						borderRadius: "10px",
						border: `1px solid ${colors.taupe}`,
						background: colors.cardBg,
						resize: "none",
					}}
				/>
			</div>

			{/* Add Button */}
			<div style={{ textAlign: "center", marginBottom: "40px" }}>
				<button
					onClick={handleAddMood}
					style={{
						padding: "15px 60px",
						background: colors.orange,
						border: "none",
						borderRadius: "30px",
						fontSize: "20px",
						cursor: "pointer",
						color: "white",
						fontWeight: "bold",
					}}
				>
					Add
				</button>
			</div>

			{/* Mood Trends Dashboard */}
			{totalMoods > 0 && (
				<div style={{ background: colors.cardBg, padding: 25, borderRadius: 16, marginBottom: 30, border: `1px solid ${colors.taupe}` }}>
					<h2 style={{ color: colors.taupe }}>📊 Mood Trends</h2>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 25 }}>
						{/* Total Moods */}
						<div style={{ background: colors.lightNeutral, padding: 20, borderRadius: 12, textAlign: "center" }}>
							<p style={{ color: colors.taupe, fontSize: 14, margin: "0 0 8px 0", fontWeight: 600 }}>
								Total Entries
							</p>
							<p style={{ fontSize: 32, fontWeight: 700, color: colors.taupe, margin: 0 }}>
								{totalMoods}
							</p>
						</div>

						{/* Most Common Mood */}
						<div style={{ background: colors.lightNeutral, padding: 20, borderRadius: 12, textAlign: "center" }}>
							<p style={{ color: colors.taupe, fontSize: 14, margin: "0 0 8px 0", fontWeight: 600 }}>
								Most Common Mood
							</p>
							<p style={{ fontSize: 24, margin: 0 }}>
								{mostCommonMood !== "None" 
									? moods.find(m => m.label === mostCommonMood)?.emoji 
									: "—"}
							</p>
							<p style={{ color: colors.taupe, fontSize: 14, marginTop: 4 }}>
								{mostCommonMood}
							</p>
						</div>
					</div>

					{/* Mood Breakdown */}
					<h3 style={{ color: colors.taupe, fontSize: "16px", marginTop: 0 }}>Mood Breakdown</h3>
					<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
						{moods.map((mood) => {
							const count = moodStats[mood.label] || 0;
							const percentage = totalMoods > 0 ? ((count / totalMoods) * 100).toFixed(0) : 0;
							return (
								<div key={mood.label}>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
										<span style={{ fontSize: "14px", fontWeight: 600, color: colors.taupe }}>
											{mood.emoji} {mood.label}
										</span>
										<span style={{ fontSize: "14px", color: colors.taupe }}>
											{count} ({percentage}%)
										</span>
									</div>
									<div
										style={{
											width: "100%",
											height: "8px",
											background: "#e8e2dbff",
											borderRadius: "4px",
											overflow: "hidden",
										}}
									>
										<div
											style={{
												width: `${percentage}%`,
												height: "100%",
												background: mood.color,
												borderRadius: "4px",
												transition: "width 0.3s ease",
											}}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Mood Logs */}
			<h2 style={{ color: colors.taupe }}>Mood History</h2>
			{moodLogs.length === 0 && (
				<p style={{ color: "#555" }}>No entries yet.</p>
			)}

			<div style={{ marginTop: "15px" }}>
				{moodLogs.map((log) => (
					<div
						key={log.id}
						style={{
							background: colors.cardBg,
							padding: "20px",
							borderRadius: "12px",
							marginBottom: "15px",
							border: `1px solid ${colors.taupe}`,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
						}}
					>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: "28px", marginBottom: "8px" }}>
								{log.mood?.emoji || "😐"}
							</div>
							<p style={{ margin: "5px 0", fontSize: "15px", color: "#666" }}>
								{log.timestamp}
							</p>

							{log.tags && log.tags.length > 0 && (
								<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
									{log.tags.map((t) => (
										<span
											key={t}
											style={{
												background: colors.sage,
												padding: "8px 14px",
												borderRadius: "20px",
												fontSize: "14px",
												color: "#333",
											}}
										>
											{t}
										</span>
									))}
								</div>
							)}

							{log.notes && (
								<p style={{ marginTop: "10px", color: "#333", fontSize: "15px" }}>
									{log.notes}
								</p>
							)}
						</div>

						{/* Delete Button */}
						<button
							onClick={() => {
								if (window.confirm("Delete this mood entry?")) {
									handleDeleteMood(log.id);
								}
							}}
							style={{
								background: "#D9534F",
								color: "#fff",
								border: "none",
								padding: "10px 16px",
								borderRadius: "10px",
								cursor: "pointer",
								fontSize: "14px",
								fontWeight: 600,
								marginLeft: "15px",
								flexShrink: 0,
							}}
						>
							Delete
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
