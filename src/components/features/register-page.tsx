import { type Component, createSignal } from "solid-js";
import type { Item } from "~/client/api";
import ItemList from "~/components/features/item-list";
import RegisterForm from "~/components/features/register-form";
import styles from "./register-page.module.css";

type RegisterPageProps = {
  listId: string;
  items: Item[];
};

const RegisterPage: Component<RegisterPageProps> = (props) => {
  const [items, setItems] = createSignal<Item[]>(props.items);

  const handleCreated = (item: Item) => {
    setItems((prev) => [item, ...prev]);
  };

  // Mutations return the updated item, so patch it in place instead of
  // re-fetching the whole list on every edit/delete/restore.
  const handleItemUpdated = (updated: Item) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  return (
    <main class={styles.main}>
      <RegisterForm listId={props.listId} onCreated={handleCreated} />

      <div class={styles.itemsSection}>
        <ItemList
          items={items()}
          listId={props.listId}
          onItemUpdated={handleItemUpdated}
        />
      </div>
    </main>
  );
};

export default RegisterPage;
