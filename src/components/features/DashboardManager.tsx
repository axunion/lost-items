import {
	ClipboardList,
	ExternalLink,
	Pencil,
	PlusCircle,
	Trash2,
} from "lucide-solid";
import { type Component, createSignal, onMount, Show } from "solid-js";
import AppHeader from "~/components/ui/AppHeader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	getHistory,
	type HistoryItem,
	removeFromHistory,
	updateHistory,
} from "~/lib/history";

interface DashboardManagerProps {
	id: string;
	origin: string;
}

const DashboardManager: Component<DashboardManagerProps> = (props) => {
	const [currentItem, setCurrentItem] = createSignal<HistoryItem | null>(null);
	const [listName, setListName] = createSignal("Loading...");

	onMount(() => {
		const history = getHistory();
		const item = history.find((i) => i.id === props.id);
		if (item) {
			setCurrentItem(item);
			setListName(item.name || "Untitled Room");
			// Refresh timestamp
			updateHistory(props.id, { timestamp: Date.now() });
		} else {
			setListName("Untitled Room");
		}
	});

	const handleEditName = () => {
		const newName = prompt("Enter new room name:", listName());
		if (newName && newName !== listName()) {
			updateHistory(props.id, { name: newName });
			setListName(newName);
			document.title = `${newName} | Dashboard`;
		}
	};

	const handleDelete = () => {
		if (
			confirm(
				`Are you sure you want to delete "${listName()}"? This action cannot be undone.`,
			)
		) {
			removeFromHistory(props.id);
			window.location.href = "/";
		}
	};

	const handleCopy = (url: string, btn: HTMLButtonElement) => {
		navigator.clipboard.writeText(url).then(() => {
			const originalHTML = btn.innerHTML;
			btn.innerHTML =
				'<span class="text-xs font-bold text-primary">Copied!</span>';
			setTimeout(() => {
				btn.innerHTML = originalHTML;
			}, 2000);
		});
	};

	return (
		<>
			<AppHeader
				title={listName()}
				showBack
				backUrl="/"
				right={
					<Show when={currentItem()?.isOwner}>
						<button
							type="button"
							onClick={handleEditName}
							class="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
							title="Edit Room Name"
						>
							<Pencil class="size-4" />
						</button>
					</Show>
				}
			/>

			<main class="px-4 py-6 space-y-6">
				<div class="space-y-6">
					{/* Registration Card */}
					<Card class="rounded-xl border-border/50">
						<CardHeader class="pb-4">
							<CardTitle class="flex items-center gap-2 text-lg font-bold">
								<PlusCircle class="size-6 text-primary" />
								Registration
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="space-y-3">
								<div class="flex items-center gap-2 bg-secondary/50 pl-4 pr-1 rounded-xl border border-input/50 h-14">
									<code class="text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground/80 font-mono">
										{props.origin}/{props.id}/register
									</code>
									<Button
										size="icon"
										variant="ghost"
										class="shrink-0 h-12 w-12 rounded-lg"
										onClick={(e) =>
											handleCopy(
												`${props.origin}/${props.id}/register`,
												e.currentTarget,
											)
										}
										title="Copy"
									>
										<ClipboardList class="size-5" />
									</Button>
								</div>
								<a
									href={`/${props.id}/register`}
									target="_blank"
									rel="noopener noreferrer"
									class="block"
								>
									<Button
										class="w-full h-14 justify-between pl-5 pr-4 font-medium rounded-xl transition-all active:scale-[0.98]"
										variant="outline"
									>
										<span class="text-base">Open Registration Page</span>
										<div class="flex items-center gap-1.5 text-primary/70">
											<ExternalLink class="size-6" />
										</div>
									</Button>
								</a>
							</div>
						</CardContent>
					</Card>

					{/* Public Room Card */}
					<Card class="rounded-xl border-border/50">
						<CardHeader class="pb-4">
							<CardTitle class="flex items-center gap-2 text-lg font-bold">
								<ClipboardList class="size-6 text-primary" />
								Public Room
							</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="space-y-3">
								<div class="flex items-center gap-2 bg-secondary/50 pl-4 pr-1 rounded-xl border border-input/50 h-14">
									<code class="text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground/80 font-mono">
										{props.origin}/{props.id}/room
									</code>
									<Button
										size="icon"
										variant="ghost"
										class="shrink-0 h-12 w-12 rounded-lg"
										onClick={(e) =>
											handleCopy(
												`${props.origin}/${props.id}/room`,
												e.currentTarget,
											)
										}
										title="Copy"
									>
										<ClipboardList class="size-5" />
									</Button>
								</div>
								<a
									href={`/${props.id}/room`}
									target="_blank"
									rel="noopener noreferrer"
									class="block"
								>
									<Button
										class="w-full h-14 justify-between pl-5 pr-4 font-medium rounded-xl transition-all active:scale-[0.98]"
										variant="outline"
									>
										<span class="text-base">Open Public View</span>
										<div class="flex items-center gap-1.5 text-primary/70">
											<ExternalLink class="size-6" />
										</div>
									</Button>
								</a>
							</div>
						</CardContent>
					</Card>

					{/* Danger Zone */}
					<Show when={currentItem()?.isOwner}>
						<div class="pt-8 space-y-4">
							<div class="flex items-center gap-4 px-1">
								<div class="h-px flex-1 bg-destructive/20" />
								<span class="text-[10px] font-bold text-destructive/60 uppercase tracking-[0.2em]">
									Danger Zone
								</span>
								<div class="h-px flex-1 bg-destructive/20" />
							</div>
							<Button
								onClick={handleDelete}
								variant="destructive"
								class="w-full h-14 font-bold text-lg flex items-center justify-center gap-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-destructive/20"
							>
								<Trash2 class="size-6" />
								Delete Room
							</Button>
						</div>
					</Show>
				</div>
			</main>
		</>
	);
};

export default DashboardManager;
