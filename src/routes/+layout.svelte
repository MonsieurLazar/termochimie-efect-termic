<script lang="ts">
  import favicon from "$lib/assets/favicon.svg"
  import "../lib/styles/global.css"

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<<<<<<< Updated upstream
{@render children()}
=======
<div class="main">
  {@render children()}
</div>

<style>
  .main {
    padding: 1rem;
  }
</style>
>>>>>>> Stashed changes
