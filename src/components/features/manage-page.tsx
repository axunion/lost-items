import { type Component, createSignal } from "solid-js";
import type { Item } from "~/client/api";
import ItemList from "~/components/features/item-list";

type ManagePageProps = {
  listId: string;
  items: Item[];
};

const ManagePage: Component<ManagePageProps> = (props) => {
  const [items, setItems] = createSignal<Item[]>(props.items);

  // Mutations return the updated item, so patch it in place instead of
  // re-fetching the whole list on every edit/delete/restore.
  const handleItemUpdated = (updated: Item) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  return (
    <ItemList
      items={items()}
      listId={props.listId}
      onItemUpdated={handleItemUpdated}
    />
  );
};

export default ManagePage;
