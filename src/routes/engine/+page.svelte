<script lang="ts">
  import { engine } from "$lib"
</script>

<section>
  {#each engine.items as item}
    <div style={item.getStyles()}>{item.name}</div>
  {/each}
</section>

<style>
  section {
    border: 1px solid black;
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
  }
</style>
