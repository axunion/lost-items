import { Plus } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { createList } from "~/lib/api";

const RoomCreateForm: Component = () => {
	const [name, setName] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		const currentName = name();
		if (!currentName) return;

		setIsSubmitting(true);

		try {
			const { id } = await createList(currentName);
			window.location.href = `/${id}`;
		} catch (error) {
			console.error("Failed to create room:", error);
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} class="space-y-4">
			<Show when={isSubmitting()}>
				<Loading variant="fullscreen" text="Creating..." />
			</Show>
			<TextField value={name()} onChange={setName}>
				<TextFieldInput
					placeholder="Room Name"
					class="h-14 rounded-xl px-4 border-input bg-background focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
					required
					disabled={isSubmitting()}
				/>
			</TextField>
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
