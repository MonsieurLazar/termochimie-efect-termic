<script lang="ts">
  import { engine } from "$lib/index"
  import { onMount } from "svelte"
  import EngineDebugPanel from "$lib/engine/ui/EngineDebugPanel.svelte"
  import PourIndicator from "$lib/engine/ui/PourIndicator.svelte"

  let parentElement: HTMLElement | null = null

  onMount(() => {
    return engine.init(parentElement!)
  })

  let cursor = $derived.by(() => {
    if (engine.engineState === "idle" && engine.hoveredItemIndex !== null) return "grab"
    if (engine.engineState !== "idle") return "grabbing"
    return "default"
  })
</script>

<EngineDebugPanel {engine} />

<section
  bind:this={parentElement}
  class:is-idle={engine.engineState === "idle"}
  class:is-carrying={engine.engineState === "carrying"}
  class:is-pouring={engine.engineState === "pouring"}
  style:cursor
>
  {#each engine.items as item}
    <div style={item.getStyles()}>
      {item.name}
      {JSON.stringify(item.state)}
    </div>
  {/each}

  {#if engine.engineState === "pouring" && engine.carriedItemIndex !== null}
    <PourIndicator 
      item={engine.items[engine.carriedItemIndex]} 
      amount={engine.pouringAmount} 
    />
  {/if}
</section>

<style>
  section {
    border: 1px solid black;
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background-color: #f0f0f0;
  }
</style>
