<script lang="ts">
	import { navigate } from "@/pages/configuration/pageStore";
	import { hexToCSSFilter } from "hex-to-css-filter";

	import Button from "@/components/Button.svelte";
	import TailSpinLoader from "@/components/TailSpinLoader.svelte";
	import ContainerList from "@/components/ContainerList.svelte";

	function navigateToContainerConfiguration(
		container: browser.contextualIdentities.ContextualIdentity,
	): void {
		navigate("containerConfiguration", container);
	}
</script>

<main>
	<h1>Containers</h1>
	{#await browser.contextualIdentities.query({})}
		<TailSpinLoader />
	{:then containers}
		<ContainerList {containers} onclick={navigateToContainerConfiguration} />
	{/await}
	<Button style="margin: 1rem auto;" onclick={() => navigate("sites", {})}>
		SITES
	</Button>
</main>

<style lang="scss">
	main {
		h1 {
			text-align: center;
			text-transform: uppercase;
			color: var(--color);
			margin: 0 0 1rem 0;
		}

		--containers-list-height: calc(600px - 10rem);
		--tail-spin-loader-height: var(--containers-list-height);
	}
</style>
