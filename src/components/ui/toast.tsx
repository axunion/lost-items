import { CircleAlert, CircleCheck, Info, X } from "lucide-solid";
import { type Component, createSignal, For } from "solid-js";
import { Portal } from "solid-js/web";

import styles from "./toast.module.css";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
};

const [toasts, setToasts] = createSignal<ToastItem[]>([]);
let toastId = 0;

const toastIcons: Record<ToastType, Component<{ class?: string }>> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

const toastTypeClass: Record<ToastType, string> = {
  success: styles.success,
  error: styles.error,
  info: styles.info,
};

function showToast(
  title: string,
  type: ToastType = "info",
  description?: string,
) {
  const id = ++toastId;
  setToasts((prev) => [...prev, { id, title, description, type }]);

  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 4000);
}

function dismissToast(id: number) {
  setToasts((prev) => prev.filter((t) => t.id !== id));
}

const ToastRegion: Component = () => {
  return (
    <Portal>
      <div class={styles.region}>
        <For each={toasts()}>
          {(toast) => {
            const IconComponent = toastIcons[toast.type];
            return (
              <div class={`${styles.toast} ${toastTypeClass[toast.type]}`}>
                <IconComponent class={styles.icon} />
                <div class={styles.body}>
                  <p class={styles.title}>{toast.title}</p>
                  {toast.description && (
                    <p class={styles.description}>{toast.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  class={styles.dismiss}
                  onClick={() => dismissToast(toast.id)}
                >
                  <X class={styles.dismissIcon} />
                </button>
              </div>
            );
          }}
        </For>
      </div>
    </Portal>
  );
};

export type { ToastType };
export { showToast, ToastRegion };
