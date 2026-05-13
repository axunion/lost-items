import { ChevronRight, Clock, DoorOpen } from "lucide-solid";
import { type Component, createSignal } from "solid-js";
import HistoryList from "~/components/features/history-list";
import RoomCreateForm from "~/components/features/room-create-form";
import type { List } from "~/lib/api";
import styles from "./dashboard.module.css";

type DashboardProps = {
	lists: List[];
	origin: string;
};

const Dashboard: Component<DashboardProps> = (props) => {
	const [newList, setNewList] = createSignal<List | null>(null);

	return (
		<main class={styles.main}>
			<div class={styles.newRoomSection}>
				<h2 class={styles.sectionTitle}>
					<DoorOpen class={styles.sectionIcon} />
					New Room
				</h2>

				<RoomCreateForm onCreated={setNewList} />
			</div>

			<div class={styles.recentSection}>
				<div class={styles.recentHeader}>
					<div class={styles.recentTitle}>
						<Clock class={styles.sectionIcon} />
						<span>Recent</span>
					</div>
					<a href="/history" class={styles.allLink}>
						All
						<ChevronRight class={styles.allLinkIcon} />
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
