import { Check } from "lucide-solid";
import { type Component, createSignal, Show } from "solid-js";
import { addItem } from "~/client/api";
import { Button } from "~/components/ui/Button";
import { Loading } from "~/components/ui/loading";
import { showToast } from "~/components/ui/toast";
import ItemFormFields from "./item-form-fields";
import styles from "./register-form.module.css";

type RegisterFormProps = {
  listId: string;
};

const RegisterForm: Component<RegisterFormProps> = (props) => {
  const [comment, setComment] = createSignal("");
  const [foundAtInput, setFoundAtInput] = createSignal("");
  const [location, setLocation] = createSignal("");
  const [imageFile, setImageFile] = createSignal<File | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addItem(props.listId, {
        comment: comment(),
        image: imageFile(),
        foundAt: foundAtInput() ? new Date(foundAtInput()) : undefined,
        location: location() || undefined,
      });
      setComment("");
      setFoundAtInput("");
      setLocation("");
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

        <ItemFormFields
          comment={comment()}
          onCommentChange={setComment}
          foundAtInput={foundAtInput()}
          onFoundAtInputChange={setFoundAtInput}
          location={location()}
          onLocationChange={setLocation}
          imageFile={imageFile()}
          onImageFileChange={setImageFile}
        />

        <Button
          type="submit"
          size="xl"
          class={styles.submitButton}
          disabled={isSubmitting()}
        >
          <div class={styles.submitButtonContent}>
            <Check class={styles.submitIcon} />
            <span>Register</span>
          </div>
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;
