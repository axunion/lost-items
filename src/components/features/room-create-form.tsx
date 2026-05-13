import { Plus } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import { createList, type List } from "~/lib/api";
import styles from "./room-create-form.module.css";

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
		<form onSubmit={handleSubmit} class={styles.form}>
			<Show when={isSubmitting()}>
				<Loading variant="fullscreen" text="Creating..." />
			</Show>
			<TextField value={name()} onChange={setName}>
				<TextFieldInput
					placeholder="Room Name"
					class={styles.input}
					required
					disabled={isSubmitting()}
				/>
			</TextField>
			<Button
				type="submit"
				size="xl"
				class={styles.button}
				disabled={isSubmitting()}
			>
				<Plus style={{ width: "1.5rem", height: "1.5rem" }} />
				Create
			</Button>
		</form>
	);
};

export default RoomCreateForm;
