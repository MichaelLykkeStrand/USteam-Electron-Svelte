<script>
  import ColorPicker from "../shared/colorPicker.svelte";
  import AccountCardPreview from "./accountCardPreview.svelte";


  export let account;
  if (account == undefined) {
    account = {
      color: "#ff5733",
      username: "User!",
      password: "password!",
      avatarImg:
        "https://avatars.cloudflare.steamstatic.com/36753f040208dc4a99a5d97f6fbee6a24f83a316_full.jpg",
    };
  }

  let showDetails = false;

  function handleMouseEnter(e) {
    showDetails = true;
  }
  function handleMouseLeave(e) {
    showDetails = false;
  }
</script>

<main on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
  {#if showDetails}
    <div class="relative-wrap">
      <div class="grid-container account-card">
        <i class="bi bi-x-square icon-red" />
        <br />
        <div class="default-margin-top">
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <button class="bi bi-clipboard-check btn btn-dark" />
            </div>
            <input
              class="form-control"
              bind:value={account.username}
              type="text"
              placeholder="Username"
            />
          </div>
        </div>
        <div>
          <div class="input-group flex-nowrap">
            <div class="input-group-prepend">
              <button class="bi bi-clipboard-check btn btn-dark" />
            </div>
            <input
              class="form-control"
              bind:value={account.password}
              type="password"
              placeholder="Password"
            />
          </div>
          <br />
        </div>
        <ColorPicker bind:value={account.color} />
        <button class="btn btn-success"
          >Sign in <i class="bi bi-box-arrow-in-right run" /></button
        >
      </div>
    </div>
  {/if}

  {#if !showDetails}
    <AccountCardPreview {account} />
  {/if}
</main>

<style>
  .relative-wrap {
    position: relative;
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
    overflow: hidden;
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
  input {
    margin-bottom: 1rem;
  }

  .default-margin-top {
    margin-top: 1rem;
  }


</style>
