import { type Component, createSignal, For, onMount } from "solid-js";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { getHistory, type HistoryItem } from "~/lib/history";

type HistoryListProps = {
	maxItems?: number;
};

const HistoryList: Component<HistoryListProps> = (props) => {
	const [history, setHistory] = createSignal<HistoryItem[]>([]);

	onMount(() => {
		setHistory(getHistory());
	});

	const displayItems = () => {
		const items = history();
		return props.maxItems ? items.slice(0, props.maxItems) : items;
	};

	return (
		<div class="space-y-3">
			{history().length === 0 ? (
				<div class="text-center py-8 text-muted-foreground bg-secondary rounded-lg">
					<p class="text-base">No history found.</p>
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
												<div class="flex flex-col gap-0.5">
													<span class="text-lg font-bold truncate text-foreground group-hover:text-primary transition-colors">
														{item.name || "Untitled Room"}
													</span>
													<span class="font-mono text-[10px] text-muted-foreground/60 break-all leading-tight">
														{item.id}
													</span>
												</div>
												<div class="flex items-center justify-between pt-1 border-t border-border/40">
													<div class="flex items-center gap-1.5 text-muted-foreground">
														<span class="text-xs">
															{
																new Date(item.timestamp)
																	.toISOString()
																	.split("T")[0]
															}
														</span>
													</div>
													{item.isOwner && (
														<span class="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold border border-primary/20">
															Admin
														</span>
													)}
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
		</div>
	);
};

export default HistoryList;
