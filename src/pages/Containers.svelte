<script lang="ts">
	import { navigate } from "@/stores/page";
	import { hexToCSSFilter } from "hex-to-css-filter";
	import TailSpinLoaderIcon from "@assets/tail-spin.svg";

	function openContainerConfiguration(
		container: browser.contextualIdentities.ContextualIdentity
	): void {
		navigate("containerConfiguration", container);
	}
</script>

<main>
	<h1>Containers</h1>
	{#await browser.contextualIdentities.query({})}
		<img src={TailSpinLoaderIcon} alt="" />
	{:then containers}
		<ul
			class="containers"
			style="--bg-color-filter: {hexToCSSFilter('#000000').filter}"
		>
			{#each containers as container}
				<li
					style="--container-color: {container.colorCode};"
				>
					<button
						on:click|preventDefault={() => openContainerConfiguration(container)}
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

		img {
			width: 5rem;
		}

		.containers {
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
