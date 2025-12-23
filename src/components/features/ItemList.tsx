import { Search } from "lucide-solid";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { Badge } from "~/components/ui/badge";
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
					<div class="text-center py-10 text-muted-foreground">
						Loading items...
					</div>
				}
			>
				<Show
					when={items().length > 0}
					fallback={
						<div class="text-center py-16 px-4">
							<div class="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<Search class="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 class="text-lg font-bold text-foreground mb-1">
								No items reported yet
							</h3>
							<p class="text-muted-foreground">
								Items reported as lost will appear here.
							</p>
						</div>
					}
				>
					<div class="grid grid-cols-2 gap-3">
						<For each={items()}>
							{(item) => (
								<Card class="overflow-hidden">
									<div class="aspect-square relative overflow-hidden bg-muted">
										<img
											src={
												item.imageUrl ||
												"https://placehold.co/600x400?text=No+Image"
											}
											alt="Lost Item"
											class="w-full h-full object-cover"
											loading="lazy"
										/>
										<Badge class="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 text-[10px] px-1.5 h-5 shadow-sm">
											{new Date(item.createdAt).toLocaleDateString()}
										</Badge>
									</div>
									<Show when={item.comment}>
										<CardContent class="p-3">
											<p class="text-sm text-foreground line-clamp-2">
												{item.comment}
											</p>
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
