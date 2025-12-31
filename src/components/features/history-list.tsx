import { type Component, For, Show } from "solid-js";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";

export type ListItem = {
	id: string;
	name: string | null;
	createdAt: string | Date;
};

type HistoryListProps = {
	lists: ListItem[];
};

const HistoryList: Component<HistoryListProps> = (props) => {
	return (
		<div class="space-y-3">
			<Show
				when={props.lists.length > 0}
				fallback={
					<div class="text-center py-8 text-muted-foreground bg-secondary rounded-lg">
						<p class="text-base">No rooms found.</p>
					</div>
				}
			>
				<div class="space-y-2">
					<For each={props.lists}>
						{(item) => (
							<a href={`/${item.id}`} class="block group">
								<Card class="rounded-xl transition-all hover:bg-secondary/50 active:scale-[0.98]">
									<CardHeader class="p-4">
										<CardTitle class="text-base font-normal">
											<div class="flex flex-col gap-2 min-w-0">
												<div class="flex flex-col gap-1">
													<span class="text-lg font-bold truncate text-foreground group-hover:text-primary transition-colors">
														{item.name || "Untitled Room"}
													</span>
													<span class="font-mono text-[10px] text-muted-foreground/50 break-all leading-tight">
														{item.id}
													</span>
												</div>
												<div class="flex items-center pt-1 border-t border-border/40">
													<span class="text-xs text-muted-foreground">
														{
															new Date(item.createdAt)
																.toISOString()
																.split("T")[0]
														}
													</span>
												</div>
											</div>
										</CardTitle>
									</CardHeader>
								</Card>
							</a>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
};

export default HistoryList;
