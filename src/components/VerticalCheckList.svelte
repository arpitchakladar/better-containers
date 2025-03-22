<script lang="ts">
	import { onMount } from "svelte";
	import { hexToCSSFilter } from "hex-to-css-filter";
	import Button from "@/components/Button.svelte";

	import Checked from "@assets/checked.svelte";

	let { items = $bindable() } = $props();

	function toggleItem(item) {
		item.checked = !item.checked;
	}
</script>

<div class="vertical-check-list">
	<ul>
		{#each items as item}
			<li style="--container-color: {item.colorCode};">
				<img
					alt=""
					src={item.icon}
					style="--container-color-filter: {hexToCSSFilter(
						item.colorCode,
					).filter}"
				/>
				<span>{item.label}</span>
				<button onclick={() => toggleItem(item)}>
					{#if item.checked}
						<Checked />
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.vertical-check-list {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		font-family: Arial, sans-serif;

		ul {
			list-style: none;
			padding: 0;

			li {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0.5rem;
				margin: 0.25rem 0;
				background: var(--bg-color);
				border-radius: 4px;
				border: 1px solid var(--color);
				color: var(--color);

				img {
					filter: var(--container-color-filter);
				}

				span {
					color: var(--container-color);
				}

				button {
					border: 1px solid var(--color);
					background: var(--bg-color);
					color: var(--color);
					border-radius: 4px;
					cursor: pointer;
					padding: 0.25rem 0.5rem;
					display: flex;
					align-items: center;
					height: 2rem;
					width: 2rem;

					--svg-color: var(--color);
				}
			}
		}
	}
</style>
