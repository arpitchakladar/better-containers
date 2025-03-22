<script lang="ts">
	import { onMount } from "svelte";
	import { hexToCSSFilter } from "hex-to-css-filter";
	import { navigate } from "@/stores/page";
	import { setContainerConfiguration } from "@/utils/storage";
	import { getContainerConfiguration } from "@/utils/storage";
	import Button from "@/components/Button.svelte";
	import ToggleButton from "@/components/ToggleButton.svelte";
	import VerticalCheckList from "@/components/VerticalCheckList.svelte";

	import TailSpinLoaderIcon from "@assets/tail-spin.svg";
	import ArrowLeftSolidSvg from "@assets/arrow-left-solid.svelte";

	let { site, name } = $props();
	let containers = $state([]);

	onMount(async () => {
		const allContainers = await browser.contextualIdentities.query({});
		for (const { name, iconUrl, colorCode, cookieStoreId } of allContainers) {
			containers.push({
				label: name,
				icon: iconUrl,
				colorCode,
				checked: site.containers.find(({container}) => container.cookieStoreId === cookieStoreId),
			});
		}
	});

	$effect(async () => {
		console.log($state.snapshot(containers));
	});
</script>

<main>
	<h1>
		<Button
			onclick={() => navigate("sites")}
		>
			<ArrowLeftSolidSvg />
		</Button>
		<div>
			{name}
		</div>
	</h1>
	{#if containers.length === 0}
		<img class="loading-spinner" src={TailSpinLoaderIcon} alt="" />
	{:else}
		<div>
			<VerticalCheckList
				bind:items={containers}
			/>
		</div>
	{/if}
</main>

<style land="scss">
	main {
		text-align: center;
		position: relative;
		padding: 1rem;
		width: 20rem;
		margin: 0 auto;
		color: var(--color);
		h1 {
			display: grid;
			grid-template-columns: auto 1fr;

			div {
				display: flex;
				flex-direction: row;
				gap: 1rem;
				justify-content: center;
				align-items: center;

				img {
					filter: var(--container-color-filter);
				}
			}
		}

		img.loading-spinner {
			width: 5rem;
		}
	}
</style>
