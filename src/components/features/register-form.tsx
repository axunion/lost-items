import { Camera, MessageSquare, Send, X } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import {
	TextField,
	TextFieldLabel,
	TextFieldTextArea,
} from "~/components/ui/text-field";
import { addItem } from "~/lib/api";

type RegisterFormProps = {
	listId: string;
};

const RegisterForm: Component<RegisterFormProps> = (props) => {
	const [comment, setComment] = createSignal("");
	const [imagePreview, setImagePreview] = createSignal<string | null>(null);
	const [imageFile, setImageFile] = createSignal<File | undefined>(undefined);
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleImageUpload = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
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
						<div class="flex justify-center w-full">
							<div class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-input rounded-xl bg-secondary/30 relative hover:bg-secondary/50 transition-colors group">
								<div class="flex flex-col items-center justify-center py-4 pointer-events-none transition-transform group-active:scale-95">
									<Camera class="w-10 h-10 text-muted-foreground/40 mb-2" />
									<p class="text-sm text-muted-foreground/60 font-bold">
										Tap to capture
									</p>
								</div>
								<input
									type="file"
									accept="image/*"
									capture="environment"
									class="absolute inset-0 opacity-0 cursor-pointer"
									onChange={handleImageUpload}
								/>
							</div>
						</div>
					</Show>

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
