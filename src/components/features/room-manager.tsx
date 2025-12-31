import {
	Check,
	ClipboardList,
	ExternalLink,
	Pencil,
	PlusCircle,
	Trash2,
} from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import AppHeader from "~/components/ui/app-header";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";

interface RoomManagerProps {
	id: string;
	origin: string;
	initialName: string;
}

const RoomManager: Component<RoomManagerProps> = (props) => {
	const [listName, setListName] = createSignal(props.initialName);
	const [tempName, setTempName] = createSignal(props.initialName);
	const [isEditOpen, setIsEditOpen] = createSignal(false);
	const [isDeleteOpen, setIsDeleteOpen] = createSignal(false);
	const [copiedUrl, setCopiedUrl] = createSignal<string | null>(null);

	const handleEditName = async (e: SubmitEvent) => {
		e.preventDefault();
		const newName = tempName().trim();
		if (newName && newName !== listName()) {
			try {
				const res = await fetch(`/api/lists/${props.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: newName }),
				});
				if (res.ok) {
					setListName(newName);
					document.title = `${newName} | Room Manager`;
				}
			} catch (error) {
				console.error("Failed to update name:", error);
			}
		}
		setIsEditOpen(false);
	};

	const handleDelete = async () => {
		try {
			const res = await fetch(`/api/lists/${props.id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				window.location.href = "/";
			}
		} catch (error) {
			console.error("Failed to delete:", error);
		}
	};

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url).then(() => {
			setCopiedUrl(url);
			setTimeout(() => {
				setCopiedUrl(null);
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
					<Dialog open={isEditOpen()} onOpenChange={setIsEditOpen}>
						<DialogTrigger class="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
							<Pencil class="size-4" />
						</DialogTrigger>
						<DialogContent>
							<form onSubmit={handleEditName}>
								<DialogHeader>
									<DialogTitle>Name</DialogTitle>
								</DialogHeader>
								<div class="py-4">
									<TextField>
										<TextFieldInput
											value={tempName()}
											onInput={(e) => setTempName(e.currentTarget.value)}
											placeholder="Name"
											autofocus
										/>
									</TextField>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsEditOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit">Save</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
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
										onClick={() =>
											handleCopy(`${props.origin}/${props.id}/register`)
										}
										title="Copy"
									>
										<Show
											when={
												copiedUrl() === `${props.origin}/${props.id}/register`
											}
											fallback={<ClipboardList class="size-5" />}
										>
											<Check class="size-5 text-primary" />
										</Show>
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
										onClick={() =>
											handleCopy(`${props.origin}/${props.id}/room`)
										}
										title="Copy"
									>
										<Show
											when={copiedUrl() === `${props.origin}/${props.id}/room`}
											fallback={<ClipboardList class="size-5" />}
										>
											<Check class="size-5 text-primary" />
										</Show>
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
					<div class="pt-8 space-y-4">
						<div class="flex items-center gap-4 px-1">
							<div class="h-px flex-1 bg-destructive/20" />
							<span class="text-[10px] font-bold text-destructive/60 uppercase tracking-[0.2em]">
								Danger Zone
							</span>
							<div class="h-px flex-1 bg-destructive/20" />
						</div>
						<AlertDialog open={isDeleteOpen()} onOpenChange={setIsDeleteOpen}>
							<AlertDialogTrigger
								class={cn(
									buttonVariants({ variant: "destructive" }),
									"w-full h-14 font-bold text-lg flex items-center justify-center gap-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-destructive/20",
								)}
							>
								<Trash2 class="size-6" />
								Delete
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete?</AlertDialogTitle>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										variant="destructive"
										onClick={handleDelete}
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</main>
		</>
	);
};

export default RoomManager;
