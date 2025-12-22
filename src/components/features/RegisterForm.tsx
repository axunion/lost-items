import { Camera, X } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { addItem } from "@/lib/store";

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
		<Card>
			<CardHeader>
				<CardTitle class="text-center">Register Lost Item</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} class="space-y-6">
					<div class="space-y-2">
						<p class="text-sm font-medium text-foreground text-center">
							Take a Photo
						</p>

						<Show when={!imagePreview()}>
							<div class="flex justify-center w-full">
								<label class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-input rounded-xl cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
									<div class="flex flex-col items-center justify-center py-6">
										<Camera class="w-10 h-10 text-muted-foreground mb-2" />
										<p class="text-sm text-muted-foreground font-medium">
											Tap to take photo
										</p>
									</div>
									<input
										type="file"
										accept="image/*"
										capture="environment"
										class="hidden"
										onChange={handleImageUpload}
									/>
								</label>
							</div>
						</Show>

						<Show when={imagePreview()}>
							<div class="relative w-full h-48 rounded-xl overflow-hidden border border-border">
								<img
									src={imagePreview() || ""}
									alt="Preview"
									class="w-full h-full object-cover"
								/>
								<button
									type="button"
									onClick={() => setImagePreview(null)}
									class="absolute top-2 right-2 p-1.5 bg-background/50 backdrop-blur-sm text-foreground rounded-full hover:bg-background/80"
								>
									<X class="w-5 h-5" />
								</button>
							</div>
						</Show>
					</div>

					<div class="space-y-2">
						<label
							for="comment"
							class="block text-sm font-medium text-foreground"
						>
							Comment (Optional)
						</label>
						<textarea
							id="comment"
							class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
							value={comment()}
							onInput={(e) => setComment(e.currentTarget.value)}
							placeholder="Where was it found? Any distinct features?"
						/>
					</div>

					<Button
						type="submit"
						size="lg"
						class="w-full"
						disabled={isSubmitting()}
					>
						{isSubmitting() ? "Registering..." : "Register Item"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default RegisterForm;
