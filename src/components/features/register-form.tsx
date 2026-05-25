import {
	Camera,
	Image as ImageIcon,
	MessageSquare,
	Send,
	X,
} from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import { Loading } from "~/components/ui/loading";
import {
	TextField,
	TextFieldLabel,
	TextFieldTextArea,
} from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import { addItem, type Item } from "~/lib/api";
import { compressImage } from "~/lib/image-utils";
import styles from "./register-form.module.css";

type RegisterFormProps = {
	listId: string;
	onCreated?: (item: Item) => void;
};

const RegisterForm: Component<RegisterFormProps> = (props) => {
	const [comment, setComment] = createSignal("");
	const [imagePreview, setImagePreview] = createSignal<string | null>(null);
	const [imageFile, setImageFile] = createSignal<File | undefined>(undefined);
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	let cameraInputRef: HTMLInputElement | undefined;
	let fileInputRef: HTMLInputElement | undefined;

	const handleImageUpload = async (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			try {
				const compressedFile = await compressImage(file);
				setImageFile(compressedFile);

				const reader = new FileReader();
				reader.onloadend = () => {
					setImagePreview(reader.result as string);
				};
				reader.readAsDataURL(compressedFile);
			} catch (error) {
				console.error("Failed to compress image:", error);
				showToast("Failed to process image", "error");
			}
		}
		(e.target as HTMLInputElement).value = "";
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const newItem = await addItem(props.listId, {
				comment: comment(),
				image: imageFile(),
			});
			props.onCreated?.(newItem);
			setComment("");
			setImagePreview(null);
			setImageFile(undefined);
			showToast("Item registered", "success");
		} catch (error) {
			console.error("Failed to register item:", error);
			showToast("Failed to register", "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div class={styles.wrapper}>
			<form onSubmit={handleSubmit} class={styles.form}>
				<Show when={isSubmitting()}>
					<Loading variant="fullscreen" text="Registering..." />
				</Show>

				<div class={styles.section}>
					<div class={styles.sectionTitle}>
						<Camera class={styles.sectionIcon} />
						<span class={styles.sectionLabel}>Photo</span>
					</div>

					<Show when={!imagePreview()}>
						<div class={styles.photoGrid}>
							<Button
								type="button"
								variant="outline"
								class={styles.photoButton}
								onClick={() => cameraInputRef?.click()}
							>
								<Camera class={styles.sectionIcon} />
								<span class={styles.sectionLabel}>Take Photo</span>
							</Button>
							<Button
								type="button"
								variant="outline"
								class={styles.photoButton}
								onClick={() => fileInputRef?.click()}
							>
								<ImageIcon class={styles.sectionIcon} />
								<span class={styles.sectionLabel}>Choose Photo</span>
							</Button>
						</div>
					</Show>

					<input
						ref={cameraInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						aria-label="Take a photo"
						class={styles.hiddenInput}
						onChange={handleImageUpload}
					/>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						aria-label="Choose a photo"
						class={styles.hiddenInput}
						onChange={handleImageUpload}
					/>

					<Show when={imagePreview()}>
						<div class={styles.previewContainer}>
							<img
								src={imagePreview() || ""}
								alt="Preview"
								class={styles.previewImage}
							/>
							<button
								type="button"
								onClick={() => {
									setImagePreview(null);
									setImageFile(undefined);
								}}
								class={styles.clearButton}
							>
								<X class={styles.clearIcon} />
							</button>
						</div>
					</Show>
				</div>

				<TextField
					value={comment()}
					onChange={setComment}
					class={styles.commentField}
				>
					<div class={styles.sectionTitle}>
						<MessageSquare class={styles.sectionIcon} />
						<TextFieldLabel class={styles.sectionLabel}>Comment</TextFieldLabel>
					</div>
					<TextFieldTextArea
						placeholder="Optional info..."
						class={styles.commentTextarea}
					/>
				</TextField>

				<Button
					type="submit"
					size="xl"
					class={styles.submitButton}
					disabled={isSubmitting()}
				>
					<div class={styles.submitButtonContent}>
						<Send class={styles.submitIcon} />
						<span>Register</span>
					</div>
				</Button>
			</form>
		</div>
	);
};

export default RegisterForm;
