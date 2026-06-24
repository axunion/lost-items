import {
  Check,
  ClipboardList,
  EllipsisVertical,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-solid";
import { type Component, For, Show } from "solid-js";
import type { List } from "~/client/api";
import { formatDate } from "~/client/utils";
import { Card, CardHeader, CardTitle } from "~/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import styles from "./history-list.module.css";

type UrlGroup = {
  label: string;
  path: string;
};

function getUrlGroups(itemId: string): UrlGroup[] {
  return [
    { label: "Registration", path: `/${itemId}/register` },
    { label: "Public Room", path: `/${itemId}/room` },
  ];
}

type HistoryListItemProps = {
  item: List;
  origin: string;
  name: string;
  copiedUrl: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (url: string) => void;
  onOpenPage: (path: string) => void;
};

export const HistoryListItem: Component<HistoryListItemProps> = (props) => {
  const urlGroups = getUrlGroups(props.item.id);

  return (
    <div class={styles.listItem} data-testid="room-item">
      <Card>
        <CardHeader class={styles.cardHeader}>
          <CardTitle class={styles.cardTitle}>
            <div class={styles.cardMeta}>
              <span class={styles.date}>
                {formatDate(props.item.createdAt)}
              </span>
              <span class={styles.name} data-testid="room-name">
                {props.name}
              </span>
              <span class={styles.id}>{props.item.id}</span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger class={styles.menuTrigger}>
          <EllipsisVertical class={styles.menuTriggerIcon} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <For each={urlGroups}>
            {(group, index) => (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuGroupLabel>{group.label}</DropdownMenuGroupLabel>
                  <DropdownMenuItem
                    onSelect={() =>
                      props.onCopy(`${props.origin}${group.path}`)
                    }
                  >
                    <Show
                      when={props.copiedUrl === `${props.origin}${group.path}`}
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
                    onSelect={() => props.onOpenPage(group.path)}
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

          <DropdownMenuItem closeOnSelect={false} onSelect={props.onEdit}>
            <Pencil />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            class={styles.destructiveItem}
            closeOnSelect={false}
            onSelect={props.onDelete}
          >
            <Trash2 />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
