import { ArrowRight, Trash2 } from "lucide-solid";
import { type Component, createSignal, For, onMount } from "solid-js";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";

type HistoryItem = {
	id: string;
	timestamp: number;
};

type HistoryListProps = {
	maxItems?: number;
};

const HistoryList: Component<HistoryListProps> = (props) => {
	const [history, setHistory] = createSignal<HistoryItem[]>([]);

	onMount(() => {
		try {
			const stored = localStorage.getItem("lost-items-history");
			if (stored) {
				setHistory(
					JSON.parse(stored).sort(
						(a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp,
					),
				);
			}
		} catch (e) {
			console.error("Failed to load history", e);
		}
	});

	const clearHistory = () => {
		localStorage.removeItem("lost-items-history");
		setHistory([]);
	};

	const displayItems = () => {
		const items = history();
		return props.maxItems ? items.slice(0, props.maxItems) : items;
	};

	return (
		<div class="space-y-3">
			{history().length > 0 && (
				<div class="flex justify-end">
					<Button variant="ghost" size="sm" onClick={clearHistory} class="text-destructive h-auto p-1">
						<Trash2 class="size-3 mr-1" />
						Clear
					</Button>
				</div>
			)}

			{history().length === 0 ? (
				<div class="text-center py-8 text-muted-foreground bg-secondary rounded-lg">
					<p class="text-sm">No history found.</p>
				</div>
			) : (
				<div class="space-y-2">
					<For each={displayItems()}>
						{(item) => (
							<a href={`/${item.id}`} class="block">
								<Card class="hover:bg-secondary/50">
									<CardHeader class="p-4">
										<CardTitle class="text-sm flex items-center justify-between">
											<span class="font-mono">{item.id.slice(0, 8)}...</span>
											<div class="flex items-center gap-2 text-muted-foreground">
												<span class="text-xs font-normal">
													{new Date(item.timestamp).toLocaleDateString()}
												</span>
												<ArrowRight class="size-4" />
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
