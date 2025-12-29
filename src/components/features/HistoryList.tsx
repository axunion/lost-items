import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import Loading from "~/components/ui/loading";

type ListItem = {
	id: string;
	name: string | null;
	createdAt: string;
};

type HistoryListProps = {
	maxItems?: number;
};

const HistoryList: Component<HistoryListProps> = (props) => {
	const [lists, setLists] = createSignal<ListItem[]>([]);
	const [loading, setLoading] = createSignal(true);

	onMount(async () => {
		try {
			const res = await fetch("/api/lists");
			if (res.ok) {
				const data = await res.json();
				setLists(data);
			}
		} catch (error) {
			console.error("Failed to fetch lists:", error);
		} finally {
			setLoading(false);
		}
	});

	const displayItems = () => {
		const items = lists();
		return props.maxItems ? items.slice(0, props.maxItems) : items;
	};

	return (
		<div class="space-y-3">
			<Show when={!loading()} fallback={<Loading variant="fullscreen" />}>
				{lists().length === 0 ? (
					<div class="text-center py-8 text-muted-foreground bg-secondary rounded-lg">
						<p class="text-base">No rooms found.</p>
					</div>
				) : (
					<div class="space-y-2">
						<For each={displayItems()}>
							{(item) => (
								<a href={`/${item.id}`} class="block group">
									<Card class="rounded-xl transition-all hover:bg-secondary/50 active:scale-[0.98]">
										<CardHeader class="p-4">
											<CardTitle class="text-base font-normal">
												<div class="flex flex-col gap-2 min-w-0">
													<div class="flex flex-col gap-1">
														<span class="text-lg font-bold truncate text-foreground group-hover:text-primary transition-colors">
															{item.name || "Untitled Room"}
														</span>
														<span class="font-mono text-[10px] text-muted-foreground/50 break-all leading-tight">
															{item.id}
														</span>
													</div>
													<div class="flex items-center pt-1 border-t border-border/40">
														<span class="text-xs text-muted-foreground">
															{new Date(item.createdAt).toISOString().split("T")[0]}
														</span>
													</div>
												</div>
											</CardTitle>
										</CardHeader>
									</Card>
								</a>
							)}
						</For>
					</div>
				)}
			</Show>
		</div>
	);
};

export default HistoryList;
