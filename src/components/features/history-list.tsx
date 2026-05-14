import {
	Check,
	ClipboardList,
	ExternalLink,
	MoreVertical,
	Pencil,
	Trash2,
} from "lucide-solid";
import {
	type Component,
	createEffect,
	createSignal,
	For,
	Show,
} from "solid-js";
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
import styles from "./history-list.module.css";

type HistoryListProps = {
	lists: List[];
	origin: string;
	newList?: List | null;
	maxItems?: number;
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

	createEffect(() => {
		const base = props.maxItems
			? props.lists.slice(0, props.maxItems)
			: props.lists;
		setLocalLists(base);
	});

	createEffect(() => {
		const created = props.newList;
		if (!created) return;

		setLocalLists((prev) => {
			const next = [created, ...prev.filter((item) => item.id !== created.id)];
			return props.maxItems ? next.slice(0, props.maxItems) : next;
		});
	});

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
			<div class={styles.wrapper}>
				<Show
					when={localLists().length > 0}
					fallback={
						<div class={styles.emptyState}>
							<p class={styles.emptyText}>No rooms found.</p>
						</div>
					}
				>
					<div class={styles.list}>
						<For each={localLists()}>
							{(item) => {
								const urlGroups = getUrlGroups(item.id);
								return (
									<div class={styles.listItem} data-testid="room-item">
										<Card>
											<CardHeader class={styles.cardHeader}>
												<CardTitle class={styles.cardTitle}>
													<div class={styles.cardMeta}>
														<span class={styles.date}>
															{formatDate(item.createdAt)}
														</span>
														<span class={styles.name} data-testid="room-name">
															{getName(item)}
														</span>
														<span class={styles.id}>{item.id}</span>
													</div>
												</CardTitle>
											</CardHeader>
										</Card>

										<DropdownMenu modal={false}>
											<DropdownMenuTrigger class={styles.menuTrigger}>
												<MoreVertical class={styles.menuTriggerIcon} />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<For each={urlGroups}>
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
																		fallback={<ClipboardList />}
																	>
																		<Check
																			style={{
																				color: "var(--color-primary)",
																			}}
																		/>
																	</Show>
																	<span>Copy URL</span>
																</DropdownMenuItem>
																<DropdownMenuItem
																	onSelect={() => handleOpenPage(group.path)}
																>
																	<ExternalLink />
																	<span>Open Page</span>
																</DropdownMenuItem>
															</DropdownMenuGroup>
															<Show when={index() < urlGroups.length - 1}>
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
													<Pencil />
													<span>Rename</span>
												</DropdownMenuItem>
												<DropdownMenuItem
													class={styles.destructiveItem}
													closeOnSelect={false}
													onSelect={() => handleDeleteClick(item.id)}
												>
													<Trash2 />
													<span>Delete</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								);
							}}
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
							<div class={styles.dialogBody}>
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
