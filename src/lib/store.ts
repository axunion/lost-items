import { api } from "./client";

export type LostItem = {
	id: string;
	comment: string;
	imageUrl?: string;
	createdAt: string; // API returns ISO string
};

export type LostItemList = {
	id: string;
	items: LostItem[];
	createdAt: string;
};

export const createList = async (): Promise<string> => {
	const res = await api.lists.$post();
	const data = await res.json();
	return data.id;
};

export const getItems = async (listId: string): Promise<LostItem[]> => {
	const res = await api.lists[":id"].items.$get({
		param: { id: listId },
	});
	if (!res.ok) return [];
	return await res.json();
};

export const addItem = async (
	listId: string,
	item: { comment: string; image?: File },
) => {
	const res = await api.lists[":id"].items.$post({
		param: { id: listId },
		form: {
			comment: item.comment,
			image: item.image || "", // Hono validator might expect string or File, need to check route definition
		},
	});

	return await res.json();
};
