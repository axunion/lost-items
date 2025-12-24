import { Search } from "lucide-solid";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { Card, CardContent } from "~/components/ui/card";
import { getItems, type LostItem } from "~/lib/store";

type ItemListProps = {
	listId: string;
};

const ItemList: Component<ItemListProps> = (props) => {
	const [items, setItems] = createSignal<LostItem[]>([]);
	const [loading, setLoading] = createSignal(true);

	onMount(async () => {
		try {
			const data = await getItems(props.listId);
			setItems(data);
		} catch (error) {
			console.error("Failed to fetch items:", error);
		} finally {
			setLoading(false);
		}
	});

	return (
		<div class="w-full">
			<Show
				when={!loading()}
				fallback={
					<div class="text-center py-8 text-muted-foreground">
						Loading items...
					</div>
				}
			>
				<Show
					when={items().length > 0}
					fallback={
						<div class="text-center py-12 px-4">
							<div class="bg-secondary w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
								<Search class="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 class="font-semibold mb-1">No items reported yet</h3>
							<p class="text-sm text-muted-foreground">
								Items reported as lost will appear here.
							</p>
						</div>
					}
				>
					<div class="grid grid-cols-2 gap-3">
						<For each={items()}>
							{(item) => (
								<Card class="overflow-hidden">
									<div class="aspect-square relative overflow-hidden bg-secondary">
										<img
											src={item.imageUrl || "https://placehold.co/300x300?text=No+Image"}
											alt="Lost Item"
											class="w-full h-full object-cover"
											loading="lazy"
										/>
										<div class="absolute top-2 right-2 bg-background/80 text-xs px-1.5 py-0.5 rounded">
											{new Date(item.createdAt).toLocaleDateString()}
										</div>
									</div>
									<Show when={item.comment}>
										<CardContent class="p-3">
											<p class="text-sm line-clamp-2">{item.comment}</p>
										</CardContent>
									</Show>
								</Card>
							)}
						</For>
					</div>
				</Show>
			</Show>
		</div>
	);
};

export default ItemList;
