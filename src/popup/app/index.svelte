<script lang="ts">
	import { onMount } from "svelte";
	let containersPromise = browser.contextualIdentities.query({});
</script>

<h1>Containers</h1>
{#await containersPromise}
	<p>Loading containers...</p>
{:then containers}
	<ul id="containers">
		{#each containers as container}
			<li style="--container-color: {container.colorCode}">
				<img src={container.iconUrl} alt="">
				<span>{container.name}</span>
			</li>
		{/each}
	</ul>
{:catch error}
	<p>Error loading containers: {error.message}</p>
{/await}

<style>
h1 {
	text-align: center;
	text-transform: uppercase;
	color: var(--color);
}

#containers {
	list-style-type: none; /* Remove default list styles */
	padding: 0;
	margin: 0;
	width: 20rem;
	background-color: var(--bg-color); /* Background color for the menu */
}

#containers li {
	position: relative;
	display: block;
	color: var(--container-color);
	background-color: var(--bg-color);
	padding: 15px 20px;
	cursor: pointer;
	display: grid;
	grid-template-columns: 2rem 1fr;
	grid-gap: 1rem;
}

#containers li img {
	width: 2rem;
}

#containers li span {
	text-decoration: none; /* Remove underline from links */
	transition: background-color 0.3s; /* Smooth transition for hover effect */
}

#containers li:hover {
	color: var(--bg-color);
	background-color: var(--container-color); /* Change background color on hover */
}

#containers li:active {
	color: var(--bg-color);
	background-color: var(--container-color); /* Active link background */
}
</style>
