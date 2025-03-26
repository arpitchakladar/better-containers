<script lang="ts">
	import { hexToCSSFilter } from "hex-to-css-filter";

	interface ContainerListProps {
		containers: browser.contextualIdentities.ContextualIdentity[];
		onclick: (
			container: browser.contextualIdentities.ContextualIdentity,
		) => void | Promise<void>;
	}

	let { containers, onclick }: ContainerListProps = $props();
</script>

<ul style="--bg-color-filter: {hexToCSSFilter('#000000').filter};">
	{#each containers as container}
		<li
			style="--container-color: {container.colorCode}; --container-color-filter: {hexToCSSFilter(
				container.colorCode,
			).filter};"
		>
			<button onclick={() => onclick(container)}>
				<img src={container.iconUrl} alt="" />
				<span>{container.name}</span>
			</button>
		</li>
	{/each}
</ul>

<style lang="scss">
	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
		background-color: var(--bg-color);
		height: var(--containers-list-height);
		overflow: auto;

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
</style>
