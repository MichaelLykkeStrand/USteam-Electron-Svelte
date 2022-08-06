<script>
	import AccountCardGrid from './components/account/accountCardGrid.svelte';
	const { ipcRenderer } = require('electron')

	let accounts = ipcRenderer.sendSync('get-accounts');
	if(ipcRenderer != null && ipcRenderer != undefined){
		console.log("life is good!")
	}
</script>

<main>
	<AccountCardGrid></AccountCardGrid>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>