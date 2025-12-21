import { ArrowRight, Trash2 } from "lucide-solid";
import { type Component, createSignal, For, onMount } from "solid-js";
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
					<button
						type="button"
						onClick={clearHistory}
						class="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
					>
						<Trash2 class="size-3" />
						Clear History
					</button>
				)}
			</div>

			{history().length === 0 ? (
				<div class="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
					<p>No history found.</p>
				</div>
			) : (
				<div class="grid gap-3">
					<For each={displayItems()}>
						{(item) => (
							<a href={`/${item.id}`} class="block">
								<Card class="hover:bg-slate-50">
									<CardHeader class="p-4">
										<CardTitle class="text-base flex items-center justify-between text-slate-900">
											<span class="font-mono">{item.id.slice(0, 8)}...</span>
											<ArrowRight class="size-4 text-slate-400" />
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
