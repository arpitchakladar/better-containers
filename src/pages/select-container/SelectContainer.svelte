<script lang="ts">
	import LoadingContainersList from "@/components/LoadingContainersList.svelte";

	const params = new URLSearchParams(window.location.search);
	const site = params.get("site");
	const containerIds = params.getAll("container");
	const selectTabCode = params.get("selectTabCode");

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

		return containerIds
			.map(
				(cookieStoreId) =>
					allContainers.find(
						(container) => container.cookieStoreId === cookieStoreId,
					) || null,
			)
			.filter(Boolean) as browser.contextualIdentities.ContextualIdentity[];
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

<style lang="scss">
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
