import { ChevronLeft } from "lucide-solid";
import { type Component, type JSX, Show } from "solid-js";

interface AppHeaderProps {
	title: string;
	showBack?: boolean;
	backUrl?: string;
	right?: JSX.Element;
}

const AppHeader: Component<AppHeaderProps> = (props) => {
	return (
		<header class="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
			<div class="max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
				<div class="flex items-center gap-3 min-w-0">
					<Show when={props.showBack}>
						<a
							href={props.backUrl || "/"}
							class="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
						>
							<ChevronLeft class="size-6" />
						</a>
					</Show>
					<h1
						id="header-title"
						class="text-xl font-black tracking-tight truncate"
					>
						{props.title}
					</h1>
				</div>
				<div class="flex items-center gap-1">{props.right}</div>
			</div>
		</header>
	);
};

export default AppHeader;
