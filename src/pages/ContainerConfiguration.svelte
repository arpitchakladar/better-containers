<script lang="ts">
	import { onMount } from "svelte";
	import { hexToCSSFilter } from "hex-to-css-filter";
	import { navigate } from "@/stores/page";
	import { setContainerConfiguration } from "@/utils/storage";
	import { getContainerConfiguration } from "@/utils/storage";
	import Button from "@/components/Button.svelte";
	import ToggleButton from "@/components/ToggleButton.svelte";
	import VerticalList from "@/components/VerticalList.svelte";

	import ArrowLeftSolidSvg from "@assets/arrow-left-solid.svelte";

	let { cookieStoreId, name, colorCode, iconUrl } = $props();

	const containerColorFilter = hexToCSSFilter(colorCode).filter;

	let cookie = $state(false);
	let domains = $state([]);

	onMount(async () => {
		const config = (await getContainerConfiguration(cookieStoreId))[cookieStoreId];
		if (config) {
			cookie = !!config.cookie;
			domains = config.domains || [];
		}
	});

	$effect(async () => {
		await setContainerConfiguration(
			cookieStoreId,
			$state.snapshot(domains),
			cookie,
		);
	});
</script>

<main>
	<h1 style="color: {colorCode}">
		<Button
			onclick={() => navigate("containers")}
		>
			<ArrowLeftSolidSvg />
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
		<ToggleButton
			label="Save Cookies"
			bind:isYes={cookie}
		/>
	</div>
	<div>
		<VerticalList
			label="Urls"
			placeholder="Add new domain..."
			bind:items={domains}
		/>
	</div>
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
	}
</style>
