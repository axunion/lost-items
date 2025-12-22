import { Button } from "@/components/ui/Button";
import { Moon, Sun } from "lucide-solid";
import { type Component, createEffect, createSignal, onMount } from "solid-js";

const ThemeToggle: Component = () => {
	const [theme, setTheme] = createSignal<"light" | "dark">("light");

	onMount(() => {
		const isDark = document.documentElement.classList.contains("dark");
		setTheme(isDark ? "dark" : "light");
	});

	const toggleTheme = () => {
		const newTheme = theme() === "light" ? "dark" : "light";
		setTheme(newTheme);
		document.documentElement.classList.toggle("dark");
		localStorage.setItem("theme", newTheme);
	};

	return (
		<Button variant="ghost" size="icon" onClick={toggleTheme} class="w-9 h-9">
			{theme() === "light" ? (
				<Sun class="h-4 w-4 transition-all" />
			) : (
				<Moon class="h-4 w-4 transition-all" />
			)}
			<span class="sr-only">Toggle theme</span>
		</Button>
	);
};

export default ThemeToggle;
