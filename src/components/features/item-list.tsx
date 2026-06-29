import { RotateCcw, Search, SquarePen, Trash2 } from "lucide-solid";
import { type Component, createSignal, For, Show } from "solid-js";
import {
  deleteItem,
  type Item,
  restoreItem,
  updateItemComment,
} from "~/client/api";
import { cx, formatDate } from "~/client/utils";
import { Button } from "~/components/ui/Button";
import { Card, CardContent } from "~/components/ui/Card";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { EmptyState } from "~/components/ui/empty-state";
import {
  TextField,
  TextFieldLabel,
  TextFieldTextArea,
} from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import styles from "./item-list.module.css";

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
  const [deletingItem, setDeletingItem] = createSignal<Item | null>(null);

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
      showToast("Failed to update comment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const item = deletingItem();
    if (!item) return;

    try {
      await deleteItem(props.listId, item.id);
      setDeletingItem(null);
      props.onItemUpdated?.();
    } catch (error) {
      console.error("Failed to delete item:", error);
      showToast("Failed to delete", "error");
    }
  };

  const handleRestore = async (item: Item) => {
    try {
      await restoreItem(props.listId, item.id);
      props.onItemUpdated?.();
    } catch (error) {
      console.error("Failed to restore item:", error);
      showToast("Failed to restore", "error");
    }
  };

  const isDeleted = (item: Item) => item.deletedAt !== null;

  return (
    <div class={styles.container}>
      <Show
        when={props.items.length > 0}
        fallback={<EmptyState icon={<Search />} message="No items found" />}
      >
        <div class={styles.grid}>
          <For each={props.items}>
            {(item) => (
              <Card
                class={cx(
                  styles.card,
                  isDeleted(item) ? styles.cardDeleted : styles.cardInStorage,
                )}
                data-testid="item-card"
              >
                <div class={styles.imageWrapper}>
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt="Lost Item"
                    class={styles.image}
                    loading="lazy"
                  />
                  <div class={styles.dateBadge}>
                    {formatDate(item.createdAt)}
                  </div>
                  <div
                    class={cx(
                      styles.statusBadge,
                      isDeleted(item)
                        ? styles.statusDeleted
                        : styles.statusInStorage,
                    )}
                  >
                    {isDeleted(item) ? "Deleted" : "In Storage"}
                  </div>
                </div>
                <Show when={item.comment}>
                  <CardContent class={styles.commentContent}>
                    <p class={styles.comment} data-testid="item-comment">
                      {item.comment}
                    </p>
                  </CardContent>
                </Show>
                <Show when={!props.readonly}>
                  <div class={styles.actions}>
                    <Show
                      when={!isDeleted(item)}
                      fallback={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Restore item"
                          onClick={() => handleRestore(item)}
                        >
                          <RotateCcw />
                        </Button>
                      }
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit item"
                        onClick={() => handleEdit(item)}
                      >
                        <SquarePen />
                      </Button>
                      <Button
                        variant="destructiveGhost"
                        size="icon"
                        aria-label="Delete item"
                        onClick={() => setDeletingItem(item)}
                      >
                        <Trash2 />
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
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          <TextField
            value={editComment()}
            onChange={setEditComment}
            class={styles.editField}
          >
            <TextFieldLabel>Comment</TextFieldLabel>
            <TextFieldTextArea placeholder="Enter comment..." />
          </TextField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveComment} disabled={isSubmitting()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingItem() !== null}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ItemList;
