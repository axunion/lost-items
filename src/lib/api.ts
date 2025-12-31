export type LostItem = {
	id: string;
	listId: string;
	comment: string;
	imageUrl?: string;
	createdAt: string | Date;
};

export const addItem = async (
	listId: string,
	item: { comment: string; image?: File },
): Promise<LostItem> => {
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
