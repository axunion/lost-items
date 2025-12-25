export type HistoryItem = {
	id: string;
	name?: string;
	timestamp: number;
	isOwner?: boolean;
};

const KEY = "lost-items-history";

export const getHistory = (): HistoryItem[] => {
	try {
		const stored = localStorage.getItem(KEY);
		if (!stored) return [];
		return JSON.parse(stored).sort(
			(a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp,
		);
	} catch (e) {
		console.error("Failed to get history", e);
		return [];
	}
};

export const addToHistory = (item: HistoryItem) => {
	try {
		const history = getHistory();
		const filtered = history.filter((i) => i.id !== item.id);
		filtered.push(item);
		// Keep last 20 items
		if (filtered.length > 20) filtered.shift();
		localStorage.setItem(KEY, JSON.stringify(filtered));
	} catch (e) {
		console.error("Failed to add to history", e);
	}
};

export const updateHistory = (id: string, updates: Partial<HistoryItem>) => {
	try {
		const history = getHistory();
		const idx = history.findIndex((i) => i.id === id);
		if (idx !== -1) {
			history[idx] = { ...history[idx], ...updates };
			localStorage.setItem(KEY, JSON.stringify(history));
		}
	} catch (e) {
		console.error("Failed to update history", e);
	}
};

export const removeFromHistory = (id: string) => {
	try {
		const history = getHistory();
		const filtered = history.filter((i) => i.id !== id);
		localStorage.setItem(KEY, JSON.stringify(filtered));
	} catch (e) {
		console.error("Failed to remove from history", e);
	}
};

export const clearHistory = () => {
	localStorage.removeItem(KEY);
};
