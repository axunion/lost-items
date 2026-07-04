import {
  type Component,
  createEffect,
  createSignal,
  For,
  Show,
} from "solid-js";
import { deleteList, type List, updateList } from "~/client/api";
import { Button } from "~/components/ui/Button";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { EmptyState } from "~/components/ui/empty-state";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import styles from "./history-list.module.css";
import { HistoryListItem } from "./history-list-item";

type HistoryListProps = {
  lists: List[];
  origin: string;
  newList?: List | null;
  maxItems?: number;
};

const HistoryList: Component<HistoryListProps> = (props) => {
  const [localLists, setLocalLists] = createSignal<List[]>(props.lists);
  const [listNames, setListNames] = createSignal<Record<string, string>>({});
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
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

  const getName = (item: List) =>
    listNames()[item.id] ?? item.name ?? "Untitled Room";

  const handleEditClick = (item: List) => {
    setTempName(getName(item));
    setEditingId(item.id);
  };

  const closeEditDialog = () => setEditingId(null);

  const handleSave = async () => {
    const id = editingId();
    if (!id) return;

    const newName = tempName().trim();
    if (!newName) {
      closeEditDialog();
      return;
    }

    try {
      await updateList(id, { name: newName });
      setListNames((prev) => ({ ...prev, [id]: newName }));
    } catch (error) {
      console.error("Failed to update name:", error);
      showToast("Failed to update name", "error");
    }
    closeEditDialog();
  };

  const handleDelete = async () => {
    const id = deletingId();
    if (!id) return;

    try {
      await deleteList(id);
      setLocalLists((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast("Failed to delete", "error");
    }
    setDeletingId(null);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
      })
      .catch((error) => {
        console.error("Failed to copy URL:", error);
        showToast("Failed to copy URL", "error");
      });
  };

  const handleOpenPage = (path: string) => {
    window.open(path, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div class={styles.wrapper}>
        <Show
          when={localLists().length > 0}
          fallback={<EmptyState message="No rooms found." />}
        >
          <div class={styles.list}>
            <For each={localLists()}>
              {(item) => (
                <HistoryListItem
                  item={item}
                  origin={props.origin}
                  name={getName(item)}
                  copiedUrl={copiedUrl()}
                  onEdit={() => handleEditClick(item)}
                  onDelete={() => setDeletingId(item.id)}
                  onCopy={handleCopy}
                  onOpenPage={handleOpenPage}
                />
              )}
            </For>
          </div>
        </Show>
      </div>

      <Dialog
        open={editingId() !== null}
        onOpenChange={(open) => !open && closeEditDialog()}
      >
        <DialogContent>
          <Show when={editingId() !== null}>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditDialog}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Show>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingId() !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Room?"
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
};

export default HistoryList;
