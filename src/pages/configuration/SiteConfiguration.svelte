<script lang="ts">
	import { onMount } from "svelte";
	import { navigate } from "@/pages/configuration/pageStore";
	import { toggleContainerForSite } from "@/utils/storage";
	import Button from "@/components/Button.svelte";
	import VerticalCheckList from "@/components/VerticalCheckList.svelte";

	import TailSpinLoader from "@assets/tail-spin.svelte";
	import ArrowLeftSolidSvg from "@assets/arrow-left-solid.svelte";

	let { site, name } = $props();
	let containers = $state([]);

	onMount(async () => {
		const allContainers = await browser.contextualIdentities.query({});
		for (const {
			name: containerName,
			iconUrl,
			colorCode,
			cookieStoreId,
		} of allContainers) {
			containers.push({
				label: containerName,
				icon: iconUrl,
				colorCode,
				checked: !!site.containers.find(
					({ container }) => container.cookieStoreId === cookieStoreId,
				),
				toggleCheck() {
					return toggleContainerForSite(name, cookieStoreId);
				},
			});
		}
	});
</script>

<main>
	<h1>
		<Button onclick={() => navigate("sites")}>
			<ArrowLeftSolidSvg />
		</Button>
		<div>
			{name}
		</div>
	</h1>
	{#if containers.length === 0}
		<TailSpinLoader />
	{:else}
		<div>
			<VerticalCheckList bind:items={containers} />
		</div>
	{/if}
</main>

<style land="scss">
	main {
		--vertical-check-list-height: calc(600px - 9rem);
		--tail-spin-loader-height: var(--vertical-check-list-height);
		h1 {
			display: grid;
			grid-template-columns: auto 1fr;

			div {
				display: flex;
				flex-direction: row;
				gap: 1rem;
				justify-content: center;
				align-items: center;
			}
		}
	}
</style>
