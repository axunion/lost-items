import { Plus } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import { createList, type List } from "~/lib/api";

type RoomCreateFormProps = {
	onCreated?: (list: List) => void;
};

const RoomCreateForm: Component<RoomCreateFormProps> = (props) => {
	const [name, setName] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		const currentName = name().trim();
		if (!currentName) return;

		setIsSubmitting(true);

		try {
			const { id } = await createList(currentName);
			props.onCreated?.({
				id,
				name: currentName,
				createdAt: new Date(),
			});
			setName("");
			showToast("Room created", "success");
		} catch (error) {
			console.error("Failed to create room:", error);
			showToast("Failed to create room", "error");
		} finally {
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
					class="h-14 px-4 bg-background"
					required
					disabled={isSubmitting()}
				/>
			</TextField>
			<Button
				type="submit"
				size="xl"
				class="w-full font-bold shadow-lg shadow-primary/20 active:scale-[0.98]"
				disabled={isSubmitting()}
			>
				<Plus class="size-6" />
				Create
			</Button>
		</form>
	);
};

export default RoomCreateForm;
