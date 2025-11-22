import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";

export type LostItem = {
	id: string;
	comment: string;
	imageUrl?: string;
	createdAt: number;
};

export type LostItemList = {
	id: string;
	items: LostItem[];
	createdAt: number;
};

// Custom persistent store implementation
const createPersistentStore = (name: string) => {
	const initialData =
		typeof window !== "undefined" ? localStorage.getItem(name) : null;
	const [store, setStore] = createStore<Record<string, string>>(
		initialData ? JSON.parse(initialData) : {},
	);

	createEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem(name, JSON.stringify(store));
		}
	});

	return [store, setStore] as const;
};

const [store, setStore] = createPersistentStore("lost-items-data-v2"); // Version bump to clear old data

export const getList = (id: string): LostItemList | null => {
	try {
		const data = store[id];
		return data ? JSON.parse(data) : null;
	} catch {
		return null;
	}
};

export const createList = (id: string): LostItemList => {
	const newList: LostItemList = {
		id,
		items: [],
		createdAt: Date.now(),
	};
	setStore(id, JSON.stringify(newList));
	return newList;
};

export const addItem = (
	listId: string,
	item: Omit<LostItem, "id" | "createdAt">,
) => {
	// Initialize list if it doesn't exist (for the mock flow)
	let list = getList(listId);
	if (!list) {
		list = createList(listId);
	}

	const newItem: LostItem = {
		...item,
		id: crypto.randomUUID(),
		createdAt: Date.now(),
	};

	const updatedList = {
		...list,
		items: [newItem, ...list.items],
	};

	setStore(listId, JSON.stringify(updatedList));
	return newItem;
};
