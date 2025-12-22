export type LostItem = {
	id: string;
	comment: string;
	imageUrl?: string;
	createdAt: string;
};

export type LostItemList = {
	id: string;
	items: LostItem[];
	createdAt: string;
};

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		return "";
	}
	return import.meta.env.SITE || "http://localhost:4321";
};

export const createList = async (): Promise<string> => {
	const res = await fetch(`${getBaseUrl()}/api/lists`, {
		method: "POST",
	});
	const data = (await res.json()) as { id: string };
	return data.id;
};

export const getItems = async (listId: string): Promise<LostItem[]> => {
	const res = await fetch(`${getBaseUrl()}/api/lists/${listId}/items`);
	if (!res.ok) return [];
	return await res.json();
};

export const addItem = async (
	listId: string,
	item: { comment: string; image?: File },
) => {
	const formData = new FormData();
	formData.append("comment", item.comment);
	if (item.image) {
		formData.append("image", item.image);
	}

	const res = await fetch(`${getBaseUrl()}/api/lists/${listId}/items`, {
		method: "POST",
		body: formData,
	});

	return await res.json();
};
