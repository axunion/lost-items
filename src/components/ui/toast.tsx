import { AlertCircle, CheckCircle, Info, X } from "lucide-solid";
import { type Component, createSignal, For } from "solid-js";
import { Portal } from "solid-js/web";

import { cn } from "~/lib/utils";

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
	success: CheckCircle,
	error: AlertCircle,
	info: Info,
};

const toastStyles: Record<ToastType, string> = {
	success: "border-green-500/50 bg-green-50 text-green-900",
	error: "border-destructive/50 bg-destructive/10 text-destructive",
	info: "border-primary/50 bg-primary/10 text-primary",
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
			<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
				<For each={toasts()}>
					{(toast) => {
						const IconComponent = toastIcons[toast.type];
						return (
							<div
								class={cn(
									"flex items-start gap-3 rounded-lg border p-4 shadow-lg",
									"animate-in fade-in-0 slide-in-from-top-2",
									toastStyles[toast.type],
								)}
							>
								<IconComponent class="size-5 shrink-0" />
								<div class="flex-1 space-y-1">
									<p class="text-sm font-semibold">{toast.title}</p>
									{toast.description && (
										<p class="text-sm opacity-80">{toast.description}</p>
									)}
								</div>
								<button
									type="button"
									class="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
									onClick={() => dismissToast(toast.id)}
								>
									<X class="size-4" />
								</button>
							</div>
						);
					}}
				</For>
			</div>
		</Portal>
	);
};

export { ToastRegion, showToast };
export type { ToastType };
