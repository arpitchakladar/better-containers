<script lang="ts">
	import * as R from "remeda";
	import LoadingContainersList from "@/components/LoadingContainersList.svelte";

	const params = new URLSearchParams(window.location.search);
	const site: string = params.get("site") ?? "404 NOT FOUND";
	const containerIds: string[] = params.getAll("container") ?? [];
	const selectTabCode: string = params.get("selectTabCode") ?? "NOTSPECIFIED";

	async function selectContainer(
		container: browser.contextualIdentities.ContextualIdentity,
	): Promise<void> {
		const cookieStoreId = container.cookieStoreId;
		await browser.runtime.sendMessage({
			type: `select-container-${selectTabCode}`,
			cookieStoreId,
		});
	}

	async function getContainers(): Promise<
		browser.contextualIdentities.ContextualIdentity[]
	> {
		const allContainers = await browser.contextualIdentities.query({});

		return R.pipe(
			containerIds,
			R.map((cookieStoreId) =>
				allContainers.find(
					R.piped(R.prop("cookieStoreId"), R.isShallowEqual(cookieStoreId)),
				),
			),
			R.filter(R.isNonNullish),
		);
	}
</script>

<svelte:head>
	<title>{site}</title>
</svelte:head>
<main>
	<h1>{site}</h1>
	<LoadingContainersList
		containers={getContainers()}
		onclick={selectContainer}
	/>
</main>

<style>
	main {
		text-align: center;
		position: relative;
		padding: 1rem;
		width: 20rem;
		margin: 0 auto;

		h1 {
			text-align: center;
			text-transform: uppercase;
			color: var(--color);
			margin: 0 0 1rem 0;
		}
	}
</style>
