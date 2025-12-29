import { Plus } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { addToHistory } from "~/lib/history";

const RoomCreateForm: Component = () => {
	const [name, setName] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const currentName = name();
		if (!currentName) return;

		setIsSubmitting(true);
		const id = crypto.randomUUID();

		// Save to local history
		addToHistory({
			id,
			name: currentName,
			timestamp: Date.now(),
			isOwner: true,
		});

		// Redirect to the dashboard
		window.location.href = `/${id}`;
	};

	return (
		<form onSubmit={handleSubmit} class="space-y-4">
			<Show when={isSubmitting()}>
				<Loading variant="fullscreen" text="Creating..." />
			</Show>
			<div class="space-y-2">
				<input
					type="text"
					value={name()}
					onInput={(e) => setName(e.currentTarget.value)}
					placeholder="Room Name"
					class="flex h-14 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 transition-all"
					required
					disabled={isSubmitting()}
				/>
			</div>
			<Button
				type="submit"
				class="w-full h-14 text-lg font-bold flex items-center justify-center gap-2 rounded-xl transition-all active:scale-[0.98]"
				disabled={isSubmitting()}
			>
				<Plus class="size-6" />
				Create
			</Button>
		</form>
	);
};

export default RoomCreateForm;
