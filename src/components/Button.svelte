<script lang="ts">
	let { children, ...props } = $props();
</script>

<button {...props}>
	{@render children()}
</button>

<style land="scss">
	button {
		padding: 0.5rem 1rem;
		border-radius: 5px;
		transition:
			background-color 300ms,
			border-color 300ms;
		border: 2px solid var(--color);
		color: var(--color);
		background: var(--bg-color);
		text-transform: uppercase;
		cursor: pointer;
		font-weight: bold;
		display: flex;
		--svg-color: var(--color);

		&:hover {
			background-color: var(--color);
			border-color: var(--bg-color);
			color: var(--bg-color);
			--svg-color: var(--bg-color);
		}
	}
</style>
