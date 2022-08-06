<script>
	export let account;
  let username = "MyUser";
  let password = "MyPassword"
  let showDetails = false;

  function handleLoginClick(e){

  }
</script>

<main>
	<div class="grid-container center account-card card-gradient">
    <i class="bi bi-x-square icon-red"></i>
    <br/>
    <i class="bi bi-clipboard-check"></i>
    <input bind:value={username} placeholder="Enter username">
    <br/>
    <i class="bi bi-clipboard-check"></i>
    <input bind:value={password} type="password" placeholder="Password">
    <br/>
    <button type="button" class="btn btn-outline-secondary">
      <i class="bi bi-palette"></i>
    </button>
    <button class="btn btn-success">Sign in <i class="bi bi-box-arrow-in-right run"></i></button>
	</div>
</main>

<style>
.account-card {
  position: relative;
  text-align: center;
  display: inline-block;
  margin: 15px;
  padding: 10px 20px 20px 20px;
  background-color: #fff;
  width: 330px;
  height: 240px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(56, 51, 64, 0.411);
}
.icon-red {
  float: right;
  color: gray;
}
.icon-red:hover {
  color: #dc3545;
  cursor: pointer;
}
input{
  margin-bottom: 1rem;
}

</style>


