<script>
	import AccountCard from "./accountCard.svelte";
	import AddAccountCard from "./addAccountCard.svelte";
</script>

<main>
	<div class="container-center">
		<div class="grid-container">
			<AccountCard />
			<AccountCard />
			<AccountCard />
			<AddAccountCard />
		</div>
	</div>
</main>

<style>
	@media only screen and (max-width: 1154px) {
		.grid-container {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-evenly;
			padding: 10px;
		}
	}
	@media only screen and (min-width: 1154px) {
		.grid-container {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			padding: 10px;
		}
	}

	.container-center {
		display: flex;
		justify-content: center;
	}
</style>
