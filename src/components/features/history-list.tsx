import {
	Check,
	ClipboardList,
	ExternalLink,
	MoreVertical,
	Pencil,
	Trash2,
} from "lucide-solid";
import { type Component, createSignal, For, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { deleteList, type List, updateList } from "~/lib/api";
import { formatDate } from "~/lib/utils";

type HistoryListProps = {
	lists: List[];
	origin: string;
};

type UrlGroup = {
	label: string;
	path: string;
};

const HistoryList: Component<HistoryListProps> = (props) => {
	const [localLists, setLocalLists] = createSignal<List[]>(props.lists);
	const [listNames, setListNames] = createSignal<Record<string, string>>({});
	const [dialogMode, setDialogMode] = createSignal<"edit" | "delete" | null>(
		null,
	);
	const [targetId, setTargetId] = createSignal<string | null>(null);
	const [tempName, setTempName] = createSignal("");
	const [copiedUrl, setCopiedUrl] = createSignal<string | null>(null);

	const getName = (item: List) => {
		return listNames()[item.id] ?? item.name ?? "Untitled Room";
	};

	const handleEditClick = (item: List) => {
		setTempName(getName(item));
		setTargetId(item.id);
		setDialogMode("edit");
	};

	const handleDeleteClick = (id: string) => {
		setTargetId(id);
		setDialogMode("delete");
	};

	const closeDialog = () => {
		setDialogMode(null);
		setTargetId(null);
	};

	const handleSave = async () => {
		const id = targetId();
		if (!id) return;

		const newName = tempName().trim();
		if (!newName) {
			closeDialog();
			return;
		}

		try {
			await updateList(id, { name: newName });
			setListNames((prev) => ({ ...prev, [id]: newName }));
		} catch (error) {
			console.error("Failed to update name:", error);
		}
		closeDialog();
	};

	const handleDelete = async () => {
		const id = targetId();
		if (!id) return;

		try {
			await deleteList(id);
			setLocalLists((prev) => prev.filter((item) => item.id !== id));
		} catch (error) {
			console.error("Failed to delete:", error);
		}
		closeDialog();
	};

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url).then(() => {
			setCopiedUrl(url);
			setTimeout(() => setCopiedUrl(null), 2000);
		});
	};

	const handleOpenPage = (path: string) => {
		window.open(path, "_blank", "noopener,noreferrer");
	};

	const getUrlGroups = (itemId: string): UrlGroup[] => [
		{ label: "Registration", path: `/${itemId}/register` },
		{ label: "Public Room", path: `/${itemId}/room` },
	];

	return (
		<>
			<div class="space-y-3">
				<Show
					when={localLists().length > 0}
					fallback={
						<div class="text-center py-8 text-muted-foreground bg-secondary rounded-lg">
							<p class="text-base">No rooms found.</p>
						</div>
					}
				>
					<div class="space-y-2">
						<For each={localLists()}>
							{(item) => (
								<div class="relative group">
									<Card class="rounded-xl transition-all hover:bg-secondary/50">
										<CardHeader class="p-4 pr-12">
											<CardTitle class="text-base font-normal">
												<div class="flex flex-col gap-1.5 min-w-0">
													<span class="text-xs text-muted-foreground">
														{formatDate(item.createdAt)}
													</span>
													<span class="text-base font-bold truncate text-foreground">
														{getName(item)}
													</span>
													<span class="font-mono text-xs text-muted-foreground/60 break-all leading-tight">
														{item.id}
													</span>
												</div>
											</CardTitle>
										</CardHeader>
									</Card>

									<div class="absolute top-3 right-3">
										<DropdownMenu modal={false}>
											<DropdownMenuTrigger class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
												<MoreVertical class="size-4" />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<For each={getUrlGroups(item.id)}>
													{(group, index) => (
														<>
															<DropdownMenuGroup>
																<DropdownMenuGroupLabel>
																	{group.label}
																</DropdownMenuGroupLabel>
																<DropdownMenuItem
																	onSelect={() =>
																		handleCopy(`${props.origin}${group.path}`)
																	}
																>
																	<Show
																		when={
																			copiedUrl() ===
																			`${props.origin}${group.path}`
																		}
																		fallback={<ClipboardList class="size-4" />}
																	>
																		<Check class="size-4 text-primary" />
																	</Show>
																	<span>Copy URL</span>
																</DropdownMenuItem>
																<DropdownMenuItem
																	onSelect={() => handleOpenPage(group.path)}
																>
																	<ExternalLink class="size-4" />
																	<span>Open Page</span>
																</DropdownMenuItem>
															</DropdownMenuGroup>
															<Show
																when={
																	index() < getUrlGroups(item.id).length - 1
																}
															>
																<DropdownMenuSeparator />
															</Show>
														</>
													)}
												</For>

												<DropdownMenuSeparator />

												<DropdownMenuItem
													closeOnSelect={false}
													onSelect={() => handleEditClick(item)}
												>
													<Pencil class="size-4" />
													<span>Rename</span>
												</DropdownMenuItem>
												<DropdownMenuItem
													class="text-destructive data-highlighted:text-destructive"
													closeOnSelect={false}
													onSelect={() => handleDeleteClick(item.id)}
												>
													<Trash2 class="size-4" />
													<span>Delete</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							)}
						</For>
					</div>
				</Show>
			</div>

			<Dialog
				open={dialogMode() !== null}
				onOpenChange={(open) => !open && closeDialog()}
			>
				<DialogContent>
					<Show when={dialogMode() === "edit"}>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSave();
							}}
						>
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
								<Button type="button" variant="outline" onClick={closeDialog}>
									Cancel
								</Button>
								<Button type="submit">Save</Button>
							</DialogFooter>
						</form>
					</Show>
					<Show when={dialogMode() === "delete"}>
						<DialogHeader>
							<DialogTitle>Delete?</DialogTitle>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={closeDialog}>
								Cancel
							</Button>
							<Button variant="destructive" onClick={handleDelete}>
								Delete
							</Button>
						</DialogFooter>
					</Show>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default HistoryList;
