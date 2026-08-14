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
  publicId: string;
  name: string | null;
  createdAt: string | Date;
};

// Forwards to fetch and throws a labeled error on a non-ok response, so each
// endpoint below only needs to state its URL, init, and error label once.
async function request(
  action: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const res = init ? await fetch(url, init) : await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to ${action}: ${res.status}`);
  }

  return res;
}

export const addItem = async (
  listId: string,
  item: { comment: string; image?: File },
): Promise<Item> => {
  const formData = new FormData();
  formData.append("comment", item.comment);
  if (item.image) {
    formData.append("image", item.image);
  }

  const res = await request("add item", `/api/lists/${listId}/items`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
};

export const getItems = async (
  listId: string,
  options?: { includeDeleted?: boolean },
): Promise<Item[]> => {
  const query = options?.includeDeleted ? "?includeDeleted=true" : "";
  const res = await request(
    "fetch items",
    `/api/lists/${listId}/items${query}`,
  );

  return await res.json();
};

export const createList = async (
  name: string,
): Promise<{ id: string; publicId: string }> => {
  const res = await request("create list", "/api/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  return await res.json();
};

export const updateList = async (
  id: string,
  data: { name: string },
): Promise<void> => {
  await request("update list", `/api/lists/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteList = async (id: string): Promise<void> => {
  await request("delete list", `/api/lists/${id}`, {
    method: "DELETE",
  });
};

export const updateItemComment = async (
  listId: string,
  itemId: string,
  comment: string,
): Promise<Item> => {
  const res = await request(
    "update item",
    `/api/lists/${listId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    },
  );

  return await res.json();
};

export const deleteItem = async (
  listId: string,
  itemId: string,
): Promise<void> => {
  await request("delete item", `/api/lists/${listId}/items/${itemId}`, {
    method: "DELETE",
  });
};

export const restoreItem = async (
  listId: string,
  itemId: string,
): Promise<void> => {
  await request(
    "restore item",
    `/api/lists/${listId}/items/${itemId}/restore`,
    {
      method: "POST",
    },
  );
};
