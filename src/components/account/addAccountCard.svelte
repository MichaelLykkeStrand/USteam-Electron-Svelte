<script>
    let username;
    let password;
    let isAddOpen = false;
    function onAddClicked(){
        if(isAddOpen == false){
            isAddOpen = true;
        }
    }

    function onAddCloseClicked(){
        isAddOpen = false;
    }

</script>

<main>
    {#if !isAddOpen}
	<div class="grid-container center add-card" on:click={onAddClicked}>
        <p>+</p>
	</div>
    {/if}
    {#if isAddOpen}
    <div class="grid-container center account-card card-gradient">
        <i class="bi bi-x-square icon-red" on:click={onAddCloseClicked}></i>
        <br/>
        <i class="bi bi-clipboard-check"></i>
        <input bind:value={username} placeholder="Enter username">
        <br/>
        <i class="bi bi-clipboard-check"></i>
        <input bind:value={password} type="password" placeholder="Password">
    </div>
    {/if}
</main>

<style>
.add-card {
    margin: 15px;
    padding: 20px 20px 20px 20px;
    background-color: #fff;
    width: 330px;
    height: 240px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(56, 51, 64, 0.411);
    text-align: center;
    font-size: x-large;
    vertical-align: middle;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.account-card {
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