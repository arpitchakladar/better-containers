<script lang="ts">
	import { hexToCSSFilter } from "hex-to-css-filter";

	import TailSpinLoader from "@/components/TailSpinLoader.svelte";

	const params = new URLSearchParams(window.location.search);
	const site = params.get("site");
	const containerIds = params.getAll("container");
	const selectTabCode = params.get("selectTabCode");

	async function selectContainer(cookieStoreId: string): Promise<void> {
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
	{#await getContainers()}
		<TailSpinLoader />
	{:then containers}
		<ul style="--bg-color-filter: {hexToCSSFilter('#000000').filter};">
			{#each containers as container}
				<li
					style="--container-color: {container.colorCode}; --container-color-filter: {hexToCSSFilter(
						container.colorCode,
					).filter};"
				>
					<button on:click={() => selectContainer(container.cookieStoreId)}>
						<img src={container.iconUrl} alt="" />
						<span>{container.name}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/await}
</main>

<style lang="scss">
	main {
		text-align: center;
		position: relative;
		padding: 1rem;
		width: 20rem;
		margin: 0 auto;
		--tail-spin-loader-height: 10rem;

		h1 {
			text-align: center;
			text-transform: uppercase;
			color: var(--color);
			margin: 0 0 1rem 0;
		}

		ul {
			list-style-type: none;
			padding: 0;
			margin: 0;
			background-color: var(--bg-color);

			button {
				position: relative;
				color: var(--container-color);
				background-color: var(--bg-color);
				padding: 15px 20px;
				cursor: pointer;
				display: grid;
				grid-template-columns: 2rem 1fr;
				grid-gap: 2rem;
				border-radius: 5px;
				transition: background-color 0.1s;
				width: 100%;
				border: none;

				img {
					width: 2rem;
					filter: var(--container-color-filter);
				}

				span {
					text-decoration: none;
					display: flex;
					align-items: center;
					font-size: 1.2rem;
				}

				&:hover {
					color: var(--bg-color);
					background-color: var(--container-color);
					img {
						filter: var(--bg-color-filter);
					}
				}

				&:active {
					color: var(--bg-color);
					background-color: var(--container-color);
				}
			}
		}
	}
</style>
