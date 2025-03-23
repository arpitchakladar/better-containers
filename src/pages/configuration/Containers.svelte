<script lang="ts">
	import { navigate } from "@/pages/configuration/pageStore";
	import { hexToCSSFilter } from "hex-to-css-filter";
	import Button from "@/components/Button.svelte";

	import TailSpinLoader from "@assets/tail-spin.svelte";
</script>

<main>
	<h1>Containers</h1>
	{#await browser.contextualIdentities.query({})}
		<TailSpinLoader />
	{:then containers}
		<ul style="--bg-color-filter: {hexToCSSFilter('#000000').filter}">
			{#each containers as container}
				<li style="--container-color: {container.colorCode};">
					<button
						on:click|preventDefault={() =>
							navigate("containerConfiguration", container)}
					>
						<img
							src={container.iconUrl}
							alt=""
							style="--container-color-filter: {hexToCSSFilter(
								container.colorCode,
							).filter}"
						/>
						<span>{container.name}</span>
					</button>
				</li>
			{/each}
		</ul>
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

		ul {
			list-style-type: none;
			padding: 0;
			margin: 0;
			background-color: var(--bg-color);
			height: var(--containers-list-height);
			overflow: auto;
			li {
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
				}
			}
		}
	}
</style>
