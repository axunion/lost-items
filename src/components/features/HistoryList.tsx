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
							<a href={`/${item.id}`} class="block">
								<Card class="hover:bg-secondary/50">
									<CardHeader class="p-4">
										<CardTitle class="text-base">
											<div class="flex flex-col gap-2 min-w-0">
												<div class="flex flex-col gap-1">
													<span class="font-bold truncate">
														{item.name || "Untitled List"}
													</span>
													<span class="font-mono text-xs text-muted-foreground break-all">
														{item.id}
													</span>
												</div>
												<div class="flex items-center justify-between mt-1">
													<span class="text-sm font-normal text-muted-foreground">
														{new Date(item.timestamp).toLocaleDateString()}
													</span>
													{item.isOwner && (
														<span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
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
