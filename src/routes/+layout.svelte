<script lang="ts">
  import "../lib/styles/global.css"

  let { children } = $props()
</script>

<div class="main">
  {@render children()}
</div>

<style>
  .main {
    padding: 1rem;
  }
</style>
