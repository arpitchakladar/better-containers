<script lang="ts">
	import { navigate } from "@/pages/configuration/pageStore";
	import { hexToCSSFilter } from "hex-to-css-filter";

	import Button from "@/components/Button.svelte";
	import TailSpinLoader from "@/components/TailSpinLoader.svelte";
	import LoadingContainersList from "@/components/LoadingContainersList.svelte";

	function navigateToContainerConfiguration(
		container: browser.contextualIdentities.ContextualIdentity,
	): void {
		navigate("containerConfiguration", container);
	}
</script>

<main>
	<h1>Containers</h1>
	<LoadingContainersList
		containers={browser.contextualIdentities.query({})}
		onclick={navigateToContainerConfiguration}
	/>
	<Button style="margin: 1rem auto;" onclick={() => navigate("sites", {})}>
		SITES
	</Button>
</main>

<style>
	main {
		h1 {
			text-align: center;
			text-transform: uppercase;
			color: var(--color);
			margin: 0 0 1rem 0;
		}

		--containers-list-height: calc(600px - 10rem);
	}
</style>
