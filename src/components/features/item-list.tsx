import { Edit, RotateCcw, Search, Trash2 } from "lucide-solid";
import { type Component, createSignal, For, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	TextField,
	TextFieldLabel,
	TextFieldTextArea,
} from "~/components/ui/text-field";
import {
	deleteItem,
	type Item,
	restoreItem,
	updateItemComment,
} from "~/lib/api";
import { formatDate } from "~/lib/utils";

type ItemListProps = {
	items: Item[];
	listId: string;
	onItemUpdated?: () => void;
	readonly?: boolean;
};

const ItemList: Component<ItemListProps> = (props) => {
	const [editingItem, setEditingItem] = createSignal<Item | null>(null);
	const [editComment, setEditComment] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleEdit = (item: Item) => {
		setEditingItem(item);
		setEditComment(item.comment || "");
	};

	const handleSaveComment = async () => {
		const item = editingItem();
		if (!item) return;

		setIsSubmitting(true);
		try {
			await updateItemComment(props.listId, item.id, editComment());
			setEditingItem(null);
			props.onItemUpdated?.();
		} catch (error) {
			console.error("Failed to update comment:", error);
			alert("コメントの更新に失敗しました");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (item: Item) => {
		if (!confirm("このアイテムを削除しますか？")) return;

		try {
			await deleteItem(props.listId, item.id);
			props.onItemUpdated?.();
		} catch (error) {
			console.error("Failed to delete item:", error);
			alert("削除に失敗しました");
		}
	};

	const handleRestore = async (item: Item) => {
		try {
			await restoreItem(props.listId, item.id);
			props.onItemUpdated?.();
		} catch (error) {
			console.error("Failed to restore item:", error);
			alert("復元に失敗しました");
		}
	};

	const isDeleted = (item: Item) => item.deletedAt !== null;

	return (
		<div class="w-full">
			<Show
				when={props.items.length > 0}
				fallback={
					<div class="text-center py-12 px-4 bg-secondary/30 rounded-xl border-2 border-dashed border-input/50">
						<div class="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search class="h-8 w-8 text-muted-foreground/40" />
						</div>
						<p class="text-base font-bold text-muted-foreground/40">
							No items found
						</p>
					</div>
				}
			>
				<div class="grid grid-cols-2 gap-3">
					<For each={props.items}>
						{(item) => (
							<Card
								class={`overflow-hidden rounded-xl border-border/50 transition-all ${
									isDeleted(item) ? "opacity-50 grayscale" : ""
								}`}
							>
								<div class="aspect-square relative overflow-hidden bg-secondary">
									<img
										src={
											item.imageUrl ||
											"https://placehold.co/300x300?text=No+Image"
										}
										alt="Lost Item"
										class="w-full h-full object-cover"
										loading="lazy"
									/>
									<div class="absolute top-2 right-2 bg-background/90 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-border/50">
										{formatDate(item.createdAt)}
									</div>
									<Show when={isDeleted(item)}>
										<div class="absolute top-2 left-2 bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
											削除済み
										</div>
									</Show>
								</div>
								<Show when={item.comment}>
									<CardContent class="p-3">
										<p class="text-xs leading-relaxed line-clamp-2 text-foreground/80">
											{item.comment}
										</p>
									</CardContent>
								</Show>
								<Show when={!props.readonly}>
									<div class="flex justify-end gap-1 p-2 border-t border-border/30">
										<Show
											when={!isDeleted(item)}
											fallback={
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRestore(item)}
												>
													<RotateCcw class="size-4" />
												</Button>
											}
										>
											<Button
												variant="ghost"
												size="icon"
												class="h-11 w-11"
												onClick={() => handleEdit(item)}
											>
												<Edit class="size-5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
												onClick={() => handleDelete(item)}
											>
												<Trash2 class="size-5" />
											</Button>
										</Show>
									</div>
								</Show>
							</Card>
						)}
					</For>
				</div>
			</Show>

			<Dialog
				open={editingItem() !== null}
				onOpenChange={(open) => !open && setEditingItem(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>コメントを編集</DialogTitle>
					</DialogHeader>
					<TextField
						value={editComment()}
						onChange={setEditComment}
						class="space-y-2"
					>
						<TextFieldLabel>コメント</TextFieldLabel>
						<TextFieldTextArea
							placeholder="コメントを入力..."
							class="min-h-[100px]"
						/>
					</TextField>
					<DialogFooter class="gap-2">
						<Button variant="outline" onClick={() => setEditingItem(null)}>
							キャンセル
						</Button>
						<Button onClick={handleSaveComment} disabled={isSubmitting()}>
							保存
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ItemList;
