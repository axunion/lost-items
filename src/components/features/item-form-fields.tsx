import {
  Camera,
  Clock,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  X,
} from "lucide-solid";
import { type Component, createMemo, onCleanup, Show } from "solid-js";
import { compressImage } from "~/client/image-utils";
import { Button } from "~/components/ui/Button";
import { SectionHeader } from "~/components/ui/section-header";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
  TextFieldTextArea,
} from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import styles from "./item-form-fields.module.css";

type ItemFormFieldsProps = {
  comment: string;
  onCommentChange: (value: string) => void;
  foundAtInput: string;
  onFoundAtInputChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  imageFile: File | undefined;
  onImageFileChange: (file: File | undefined) => void;
  // Photo already stored on the item being edited; shown until a new file is picked.
  existingImageUrl?: string | null;
};

// Shared Photo / Found Time / Location / Comment fields, used by both the
// register form and the item edit dialog so the two flows stay in sync.
const ItemFormFields: Component<ItemFormFieldsProps> = (props) => {
  const newPreviewUrl = createMemo(() => {
    const file = props.imageFile;
    if (!file) return null;
    const url = URL.createObjectURL(file);
    onCleanup(() => URL.revokeObjectURL(url));
    return url;
  });

  const displayedPreview = () =>
    newPreviewUrl() ?? props.existingImageUrl ?? null;

  let cameraInputRef: HTMLInputElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

  const handleImageUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        props.onImageFileChange(compressedFile);
      } catch (error) {
        console.error("Failed to compress image:", error);
        showToast("Failed to process image", "error");
      }
    }
    (e.target as HTMLInputElement).value = "";
  };

  return (
    <>
      <div class={styles.section}>
        <SectionHeader icon={<Camera />}>Photo</SectionHeader>

        <Show when={!props.imageFile}>
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

        <Show when={displayedPreview()}>
          <div class={styles.previewContainer}>
            <img
              src={displayedPreview() || ""}
              alt="Preview"
              class={styles.previewImage}
            />
            <Show when={props.imageFile}>
              <button
                type="button"
                aria-label="Clear image"
                onClick={() => props.onImageFileChange(undefined)}
                class={styles.clearButton}
              >
                <X class={styles.clearIcon} />
              </button>
            </Show>
          </div>
        </Show>
      </div>

      <TextField
        value={props.foundAtInput}
        onChange={props.onFoundAtInputChange}
        class={styles.section}
      >
        <SectionHeader icon={<Clock />}>
          <TextFieldLabel>Found Time</TextFieldLabel>
        </SectionHeader>
        <TextFieldInput type="datetime-local" />
      </TextField>

      <TextField
        value={props.location}
        onChange={props.onLocationChange}
        class={styles.section}
      >
        <SectionHeader icon={<MapPin />}>
          <TextFieldLabel>Location</TextFieldLabel>
        </SectionHeader>
        <TextFieldInput
          type="text"
          placeholder="Where it was found..."
          maxlength={200}
        />
      </TextField>

      <TextField
        value={props.comment}
        onChange={props.onCommentChange}
        class={styles.commentField}
      >
        <SectionHeader icon={<MessageSquare />}>
          <TextFieldLabel>Comment</TextFieldLabel>
        </SectionHeader>
        <TextFieldTextArea
          placeholder="Optional info..."
          class={styles.commentTextarea}
        />
      </TextField>
    </>
  );
};

export default ItemFormFields;
