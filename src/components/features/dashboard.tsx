import { ChevronRight, Clock, DoorOpen } from "lucide-solid";
import { type Component, createSignal } from "solid-js";
import HistoryList from "~/components/features/history-list";
import RoomCreateForm from "~/components/features/room-create-form";
import type { List } from "~/lib/api";

type DashboardProps = {
	lists: List[];
	origin: string;
};

const Dashboard: Component<DashboardProps> = (props) => {
	const [newList, setNewList] = createSignal<List | null>(null);

	return (
		<main class="px-4 py-6 space-y-6">
			<div class="space-y-4 py-2">
				<h2 class="flex items-center gap-2 text-lg font-bold px-1">
					<DoorOpen class="size-6 text-primary" />
					New Room
				</h2>

				<RoomCreateForm onCreated={setNewList} />
			</div>

			<div class="space-y-4 pt-8 border-t border-border/50">
				<div class="flex items-center justify-between px-1">
					<div class="flex items-center gap-2 text-lg font-bold">
						<Clock class="size-6 text-primary" />
						<span>Recent</span>
					</div>
					<a
						href="/history"
						class="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
					>
						All
						<ChevronRight class="size-4" />
					</a>
				</div>
				<HistoryList
					lists={props.lists}
					origin={props.origin}
					newList={newList()}
					maxItems={3}
				/>
			</div>
		</main>
	);
};

export default Dashboard;
