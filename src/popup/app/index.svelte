<h1>Containers</h1>
<!-- Asyncronously load all the containers -->
{#await browser.contextualIdentities.query({})}
	<p>Loading containers...</p>
{:then containers}
	<ul class="containers">
		{#each containers as container}
			<li style="--container-color: {container.colorCode}">
				<img src={container.iconUrl} alt="" />
				<span>{container.name}</span>
			</li>
		{/each}
	</ul>
{:catch error}
	<p>Error loading containers: {error.message}</p>
{/await}

<style lang="scss">
	h1 {
		text-align: center;
		text-transform: uppercase;
		color: var(--color);
	}
	.containers {
		list-style-type: none;
		padding: 0;
		margin: 0;
		width: 20rem;
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
			grid-gap: 1rem;
			&:hover {
				color: var(--bg-color);
				background-color: var(--container-color);
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
				transition: background-color 0.3s;
			}
		}
	}
</style>
