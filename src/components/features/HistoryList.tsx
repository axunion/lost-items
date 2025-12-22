import { ArrowRight, Trash2 } from "lucide-solid";
import { type Component, createSignal, For, onMount } from "solid-js";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";

type HistoryItem = {
	id: string;
	timestamp: number;
	title?: string;
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
		<div class="space-y-4">
			<div class="flex justify-end">
				{history().length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearHistory}
						class="text-destructive hover:text-destructive hover:bg-destructive/10 h-auto p-0 px-2"
					>
						<Trash2 class="size-3 mr-1" />
						Clear History
					</Button>
				)}
			</div>

			{history().length === 0 ? (
				<div class="text-center py-10 text-muted-foreground bg-muted/50 rounded-xl border border-border">
					<p>No history found.</p>
				</div>
			) : (
				<div class="grid gap-3">
					<For each={displayItems()}>
						{(item) => (
							<a href={`/${item.id}`} class="block group">
								<Card class="transition-colors hover:bg-muted/50">
									<CardHeader class="p-4">
										<CardTitle class="text-base flex items-center justify-between">
											<span class="font-mono">{item.id.slice(0, 8)}...</span>
											<ArrowRight class="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
										</CardTitle>
										<CardDescription>
											Visited: {new Date(item.timestamp).toLocaleDateString()}
										</CardDescription>
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
