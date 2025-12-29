import { Search } from "lucide-solid";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { Card, CardContent } from "~/components/ui/card";
import Loading from "~/components/ui/loading";
import { getItems, type LostItem } from "~/lib/api";

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
				fallback={<Loading variant="fullscreen" text="Loading items..." />}
			>
				<Show
					when={items().length > 0}
					fallback={
						<div class="text-center py-12 px-4 bg-secondary/30 rounded-xl border-2 border-dashed border-input/50">
							<div class="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<Search class="h-8 w-8 text-muted-foreground/40" />
							</div>
							<p class="text-base font-bold text-muted-foreground/40">
								No items found
							</p>
						</div>
					}
				>
					<div class="grid grid-cols-2 gap-3">
						<For each={items()}>
							{(item) => (
								<Card class="overflow-hidden rounded-xl border-border/50 transition-all active:scale-[0.98]">
									<div class="aspect-square relative overflow-hidden bg-secondary">
										<img
											src={
												item.imageUrl ||
												"https://placehold.co/300x300?text=No+Image"
											}
											alt="Lost Item"
											class="w-full h-full object-cover"
											loading="lazy"
										/>
										<div class="absolute top-2 right-2 bg-background/90 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-border/50">
											{new Date(item.createdAt).toISOString().split("T")[0]}
										</div>
									</div>
									<Show when={item.comment}>
										<CardContent class="p-3">
											<p class="text-xs leading-relaxed line-clamp-2 text-foreground/80">
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
