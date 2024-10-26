<script lang="ts">
	import TailSpinLoaderIcon from "@assets/tail-spin.svg";
	import { hexToCSSFilter } from "hex-to-css-filter";
</script>

<div>
	<h1>Containers</h1>
	{#await browser.contextualIdentities.query({})}
		<img src={TailSpinLoaderIcon} alt="" />
	{:then containers}
		<ul
			class="containers"
			style="--bg-color-filter: {hexToCSSFilter('#333333').filter}"
		>
			{#each containers as container}
				<li style="--container-color: {container.colorCode};">
					<img
						src={container.iconUrl}
						alt=""
						style="--container-color-filter: {hexToCSSFilter(
							container.colorCode,
						).filter}"
					/>
					<span>{container.name}</span>
				</li>
			{/each}
		</ul>
	{/await}
</div>

<style lang="scss">
	div {
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
			filter: var(--container-color-filter);
		}

		.containers {
			list-style-type: none;
			padding: 0;
			margin: 0;
			background-color: var(--bg-color);
			li {
				position: relative;
				display: block;
				color: var(--container-color);
				background-color: var(--bg-color);
				padding: 15px 20px;
				cursor: pointer;
				display: grid;
				grid-template-columns: 2rem 1fr;
				grid-gap: 2rem;
				border-radius: 5px;
				transition: background-color 0.1s;

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
</style>
