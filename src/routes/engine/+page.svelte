<script lang="ts">
  import { engine } from "$lib/index"
  import { onMount } from "svelte"

  let parentElement: HTMLElement | null = null

  onMount(() => {
    const unmount = engine.init(parentElement!)
    return unmount
  })
</script>

<p>
  Hovered item: {engine.hoveredItemIndex}
  Moving item: {engine.movingItemIndex}
  MouseX: {engine.mouseX}
  MouseY: {engine.mouseY}
</p>

<section bind:this={parentElement}>
  {#each engine.items as item}
    {#key item.position}
      <div style={item.getStyles()}>
        {item.name}
      </div>
    {/key}
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
