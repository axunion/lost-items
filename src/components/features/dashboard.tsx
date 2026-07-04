import { ChevronRight, Clock, DoorOpen } from "lucide-solid";
import { type Component, createSignal } from "solid-js";
import type { List } from "~/client/api";
import HistoryList from "~/components/features/history-list";
import RoomCreateForm from "~/components/features/room-create-form";
import { SectionHeader } from "~/components/ui/section-header";
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
        <SectionHeader icon={<DoorOpen />}>New Room</SectionHeader>
        <RoomCreateForm onCreated={setNewList} />
      </div>

      <div class={styles.recentSection}>
        <div class={styles.recentHeader}>
          <SectionHeader icon={<Clock />}>Recent</SectionHeader>
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
