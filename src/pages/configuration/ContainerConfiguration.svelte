<script lang="ts">
	import { onMount } from "svelte";
	import { hexToCSSFilter } from "hex-to-css-filter";
	import { navigate } from "@/pages/configuration/pageStore";
	import {
		setContainerConfiguration,
		getContainerConfiguration,
	} from "@/utils/storage";
	import Button from "@/components/Button.svelte";
	import ToggleButton from "@/components/ToggleButton.svelte";
	import VerticalList from "@/components/VerticalList.svelte";

	import BackIcon from "@/components/BackIcon.svelte";

	let { cookieStoreId, name, colorCode, iconUrl } = $props();

	const containerColorFilter = hexToCSSFilter(colorCode).filter;

	let cookie = $state(false);
	let sites: string[] = $state([]);

	onMount(async () => {
		const config = await getContainerConfiguration(cookieStoreId);
		({ cookie, sites } = config ?? { cookie: false, sites: [] });
	});

	$effect(() => {
		setContainerConfiguration(cookieStoreId, $state.snapshot(sites), cookie);
	});
</script>

<main>
	<h1 style="color: {colorCode}">
		<Button onclick={() => navigate("containers")}>
			<BackIcon />
		</Button>
		<div>
			<img
				alt={name}
				style="--container-color-filter: {containerColorFilter}"
				src={iconUrl}
			/>
			<span>
				{name}
			</span>
		</div>
	</h1>
	<div>
		<ToggleButton label="Save Cookies" bind:checked={cookie} />
	</div>
	<div>
		<VerticalList placeholder="Add new site..." bind:items={sites} />
	</div>
</main>

<style>
	main {
		--vertical-list-height: calc(600px - 15rem);
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
	}
</style>
