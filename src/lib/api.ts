export type Item = {
	id: string;
	listId: string;
	comment: string | null;
	imageUrl: string | null;
	createdAt: string | Date;
	deletedAt: string | Date | null;
};

export type List = {
	id: string;
	name: string | null;
	createdAt: string | Date;
};

export const addItem = async (
	listId: string,
	item: { comment: string; image?: File },
): Promise<Item> => {
	const formData = new FormData();
	formData.append("comment", item.comment);
	if (item.image) {
		formData.append("image", item.image);
	}

	const res = await fetch(`/api/lists/${listId}/items`, {
		method: "POST",
		body: formData,
	});

	if (!res.ok) {
		throw new Error(`Failed to add item: ${res.status}`);
	}

	return await res.json();
};

export const getItems = async (listId: string): Promise<Item[]> => {
	const res = await fetch(`/api/lists/${listId}/items`);

	if (!res.ok) {
		throw new Error(`Failed to fetch items: ${res.status}`);
	}

	return await res.json();
};

export const createList = async (name: string): Promise<{ id: string }> => {
	const res = await fetch("/api/lists", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});

	if (!res.ok) {
		throw new Error(`Failed to create list: ${res.status}`);
	}

	return await res.json();
};

export const updateList = async (
	id: string,
	data: { name: string },
): Promise<void> => {
	const res = await fetch(`/api/lists/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		throw new Error(`Failed to update list: ${res.status}`);
	}
};

export const deleteList = async (id: string): Promise<void> => {
	const res = await fetch(`/api/lists/${id}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error(`Failed to delete list: ${res.status}`);
	}
};

export const updateItemComment = async (
	listId: string,
	itemId: string,
	comment: string,
): Promise<Item> => {
	const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ comment }),
	});

	if (!res.ok) {
		throw new Error(`Failed to update item: ${res.status}`);
	}

	return await res.json();
};

export const deleteItem = async (
	listId: string,
	itemId: string,
): Promise<void> => {
	const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error(`Failed to delete item: ${res.status}`);
	}
};

export const restoreItem = async (
	listId: string,
	itemId: string,
): Promise<void> => {
	const res = await fetch(`/api/lists/${listId}/items/${itemId}/restore`, {
		method: "POST",
	});

	if (!res.ok) {
		throw new Error(`Failed to restore item: ${res.status}`);
	}
};
