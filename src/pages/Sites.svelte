<script lang="ts">
	import { onMount } from "svelte";
	import { hexToCSSFilter } from "hex-to-css-filter";

	import { navigate } from "@/stores/page";
	import { getSiteConfigurations } from "@/utils/storage";
	import Button from "@/components/Button.svelte";

	import TailSpinLoaderIcon from "@assets/tail-spin.svg";
</script>

<main>
	<h1>Sites</h1>
	{#await getSiteConfigurations()}
		<img class="loading-spinner" src={TailSpinLoaderIcon} alt="" />
	{:then sites}
		<ul
			class="sites"
			style="--bg-color-filter: {hexToCSSFilter('#000000').filter}"
		>
			{#each Object.entries(sites) as [siteName, site]}
				<li>
					<button
						on:click|preventDefault={() => navigate("siteConfiguration", { site, name: siteName })}
						style="grid-template-columns: {"2rem ".repeat(site.containers.length)}1fr;"
					>
						{#each site.containers as { container, ...rest }}
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
	<Button onclick={() => navigate("containers", {})}>
		CONTAINERS
	</Button>
</main>

<style land="scss">
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

		img.loading-spinner {
			width: 5rem;
		}

		.sites {
			list-style-type: none;
			padding: 0;
			margin: 0;
			background-color: var(--bg-color);
			li {
				button {
					position: relative;
					color: var(--container-color);
					background-color: var(--bg-color);
					padding: 15px 20px;
					cursor: pointer;
					display: grid;
					grid-gap: 2rem;
					border-radius: 5px;
					transition: background-color 100ms, border-color 100ms;
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
						width: 2rem;
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
