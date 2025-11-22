import { Search } from "lucide-solid";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getList, type LostItem } from "@/lib/store";

type ItemListProps = {
	listId: string;
};

const ItemList: Component<ItemListProps> = (props) => {
	const [items, setItems] = createSignal<LostItem[]>([]);
	const [loading, setLoading] = createSignal(true);

	onMount(() => {
		// Simulate loading
		setTimeout(() => {
			const list = getList(props.listId);
			if (list) {
				setItems(list.items);
			}
			setLoading(false);
		}, 500);
	});

	return (
		<div class="w-full">
			<Show
				when={!loading()}
				fallback={
					<div class="text-center py-10 text-slate-500">Loading items...</div>
				}
			>
				<Show
					when={items().length > 0}
					fallback={
						<div class="text-center py-20 px-4">
							<div class="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
								<Search class="h-10 w-10 text-slate-400" />
							</div>
							<h3 class="text-lg font-semibold text-slate-900 mb-1">
								No items reported yet
							</h3>
							<p class="text-slate-500 max-w-xs mx-auto">
								Items reported as lost will appear here.
							</p>
						</div>
					}
				>
					<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						<For each={items()}>
							{(item) => (
								<Card class="overflow-hidden border-0 shadow-sm bg-slate-50 group">
									<div class="aspect-square relative overflow-hidden rounded-lg bg-slate-200">
										<img
											src={
												item.imageUrl ||
												"https://placehold.co/600x400?text=No+Image"
											}
											alt="Lost Item"
											class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
											loading="lazy"
										/>
										<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										<Badge class="absolute top-2 right-2 bg-white/90 text-slate-900 shadow-sm text-[10px] px-1.5 h-5">
											{new Date(item.createdAt).toLocaleDateString()}
										</Badge>
									</div>
									<Show when={item.comment}>
										<CardContent class="p-3">
											<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">
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
