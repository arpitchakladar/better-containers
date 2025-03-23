<script lang="ts">
	import { hexToCSSFilter } from "hex-to-css-filter";

	import CheckedIcon from "@/components/CheckedIcon.svelte";

	export interface VerticalCheckListItem {
		label: string;
		icon: string;
		colorCode: string;
		checked: boolean,
		toggleCheck: () => Promise<boolean>,
	};

	interface VerticalCheckListItemProps {
		items: VerticalCheckListItem[];
	}

	let { items = $bindable() }: VerticalCheckListItemProps = $props();

	async function toggleItem(item: VerticalCheckListItem): Promise<void> {
		item.checked = await item.toggleCheck();
	}
</script>

<div class="vertical-check-list">
	<ul>
		{#each items as item}
			<li style="--container-color: {item.colorCode};">
				<img
					alt=""
					src={item.icon}
					style="--container-color-filter: {hexToCSSFilter(item.colorCode)
						.filter}"
				/>
				<span>{item.label}</span>
				<button onclick={() => toggleItem(item)}>
					{#if item.checked}
						<CheckedIcon />
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
			height: var(--vertical-check-list-height);
			overflow: auto;

			li {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0.5rem;
				margin: 0.25rem 0;
				background: var(--bg-color);
				border-radius: 4px;
				border: 2px solid var(--color);
				color: var(--color);

				img {
					filter: var(--container-color-filter);
				}

				span {
					color: var(--container-color);
				}

				button {
					border: 2px solid var(--color);
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
