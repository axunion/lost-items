import {
	Camera,
	Image as ImageIcon,
	MessageSquare,
	Send,
	X,
} from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import {
	TextField,
	TextFieldLabel,
	TextFieldTextArea,
} from "~/components/ui/text-field";
import { addItem } from "~/lib/api";
import { compressImage } from "~/lib/image-utils";

type RegisterFormProps = {
	listId: string;
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
				alert("画像の処理に失敗しました。もう一度お試しください。");
			}
		}
		// Reset input value to allow selecting the same file again
		(e.target as HTMLInputElement).value = "";
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await addItem(props.listId, {
				comment: comment(),
				image: imageFile(),
			});
			window.location.href = `/${props.listId}`;
		} catch (error) {
			console.error("Failed to register item:", error);
			alert("Failed to register item. Please try again.");
			setIsSubmitting(false);
		}
	};

	return (
		<div class="space-y-8">
			<form onSubmit={handleSubmit} class="space-y-8">
				<Show when={isSubmitting()}>
					<Loading variant="fullscreen" text="Registering..." />
				</Show>
				{/* Photo Section */}
				<div class="space-y-4">
					<div class="flex items-center gap-2 px-1">
						<Camera class="size-6 text-primary" />
						<span class="text-lg font-bold">Photo</span>
					</div>

					<Show when={!imagePreview()}>
						<div class="grid grid-cols-2 gap-3">
							<Button
								type="button"
								variant="outline"
								class="h-24 flex-col gap-2 rounded-xl border-2 border-dashed"
								onClick={() => cameraInputRef?.click()}
							>
								<Camera class="size-8 text-muted-foreground" />
								<span class="text-sm font-medium">カメラで撮影</span>
							</Button>
							<Button
								type="button"
								variant="outline"
								class="h-24 flex-col gap-2 rounded-xl border-2 border-dashed"
								onClick={() => fileInputRef?.click()}
							>
								<ImageIcon class="size-8 text-muted-foreground" />
								<span class="text-sm font-medium">写真を選択</span>
							</Button>
						</div>
					</Show>

					{/* Hidden file inputs */}
					<input
						ref={cameraInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						class="hidden"
						onChange={handleImageUpload}
					/>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						class="hidden"
						onChange={handleImageUpload}
					/>

					<Show when={imagePreview()}>
						<div class="relative w-full h-48 rounded-xl overflow-hidden border border-border shadow-sm">
							<img
								src={imagePreview() || ""}
								alt="Preview"
								class="w-full h-full object-cover"
							/>
							<button
								type="button"
								onClick={() => {
									setImagePreview(null);
									setImageFile(undefined);
								}}
								class="absolute top-2 right-2 p-2 bg-background/90 rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-90"
							>
								<X class="w-5 h-5" />
							</button>
						</div>
					</Show>
				</div>

				{/* Comment Section */}
				<TextField value={comment()} onChange={setComment} class="space-y-4">
					<div class="flex items-center gap-2 px-1">
						<MessageSquare class="size-6 text-primary" />
						<TextFieldLabel class="text-lg font-bold contents">
							Comment
						</TextFieldLabel>
					</div>
					<TextFieldTextArea
						placeholder="Optional info..."
						class="resize-none min-h-[120px] text-base p-4 rounded-xl focus-visible:ring-primary/40 focus-visible:ring-offset-1 border-input bg-background"
					/>
				</TextField>

				<Button
					type="submit"
					class="w-full h-14 text-lg font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
					disabled={isSubmitting()}
				>
					<div class="flex items-center gap-2">
						<Send class="size-6" />
						<span>Register</span>
					</div>
				</Button>
			</form>
		</div>
	);
};

export default RegisterForm;
