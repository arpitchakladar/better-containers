<script lang="ts">
	import { hexToCSSFilter } from "hex-to-css-filter";
	import { navigate } from "@/pages/configuration/pageStore";
	import { getSiteConfigurations } from "@/utils/storage";
	import Button from "@/components/Button.svelte";

	import TailSpinLoader from "@/components/TailSpinLoader.svelte";
</script>

<main>
	<h1>Sites</h1>
	{#await getSiteConfigurations()}
		<TailSpinLoader />
	{:then sites}
		<ul style="--bg-color-filter: {hexToCSSFilter('#000000').filter}">
			{#each Object.entries(sites) as [siteName, site]}
				<li>
					<button
						on:click|preventDefault={() =>
							navigate("siteConfiguration", {
								site,
								name: siteName,
							})}
						style="grid-template-columns: {'1rem '.repeat(
							site.containers.length,
						)}1fr;"
					>
						{#each site.containers as { container }}
							<img
								src={container.iconUrl}
								alt=""
								style="--container-color-filter: {hexToCSSFilter(
									container.colorCode,
								).filter}"
							/>
						{/each}
						<span>{siteName}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/await}
	<Button style="margin: 1rem auto;" onclick={() => navigate("containers", {})}>
		CONTAINERS
	</Button>
</main>

<style land="scss">
	main {
		--sites-list-height: calc(600px - 10rem);
		--tail-spin-loader-height: var(--sites-list-height);

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
			height: var(--sites-list-height);
			overflow: auto;
			li {
				button {
					position: relative;
					color: var(--container-color);
					background-color: var(--bg-color);
					padding: 15px 20px;
					cursor: pointer;
					display: grid;
					grid-gap: 0.5rem;
					border-radius: 5px;
					transition:
						background-color 100ms,
						border-color 100ms;
					width: 100%;
					border: 3px solid var(--bg-color);

					&:hover {
						border-color: var(--color);
					}

					&:active {
						color: var(--bg-color);
						background-color: var(--container-color);
					}

					img {
						width: 1rem;
						margin: auto 0;
						filter: var(--container-color-filter);
					}

					span {
						text-decoration: none;
						display: flex;
						align-items: center;
						font-size: 1.2rem;
						color: var(--color);
						text-overflow: hidden;
						text-wrap: nowrap;
						overflow: hidden;
					}
				}
			}
		}
	}
</style>
