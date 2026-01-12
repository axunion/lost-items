import type { Component } from "solid-js";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

type ConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
};

const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
	const handleConfirm = () => {
		props.onConfirm();
		props.onOpenChange(false);
	};

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{props.title}</DialogTitle>
				</DialogHeader>
				{props.description && (
					<p class="text-sm text-muted-foreground">{props.description}</p>
				)}
				<DialogFooter class="gap-2">
					<Button variant="outline" onClick={() => props.onOpenChange(false)}>
						{props.cancelLabel ?? "Cancel"}
					</Button>
					<Button variant={props.variant ?? "default"} onClick={handleConfirm}>
						{props.confirmLabel ?? "Confirm"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export { ConfirmDialog };
export type { ConfirmDialogProps };
