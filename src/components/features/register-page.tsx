import { type Component, createSignal } from "solid-js";
import ItemList from "~/components/features/item-list";
import RegisterForm from "~/components/features/register-form";
import { showToast } from "~/components/ui/toast";
import { getItems, type Item } from "~/lib/api";

type RegisterPageProps = {
	listId: string;
	items: Item[];
};

const RegisterPage: Component<RegisterPageProps> = (props) => {
	const [items, setItems] = createSignal<Item[]>(props.items);

	const refreshItems = async () => {
		try {
			const latest = await getItems(props.listId);
			setItems(latest);
		} catch (error) {
			console.error("Failed to refresh items:", error);
			showToast("Failed to refresh items", "error");
		}
	};

	const handleCreated = (item: Item) => {
		setItems((prev) => [item, ...prev]);
	};

	return (
		<main class="px-4 py-6 space-y-6">
			<RegisterForm listId={props.listId} onCreated={handleCreated} />

			<div class="mt-8 pt-8 border-t border-border/50">
				<ItemList
					items={items()}
					listId={props.listId}
					onItemUpdated={refreshItems}
				/>
			</div>
		</main>
	);
};

export default RegisterPage;
