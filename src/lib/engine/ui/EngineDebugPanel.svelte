<script lang="ts">
  import { Engine } from "../core.svelte"

  let { engine }: { engine: Engine } = $props()
</script>

<p>
  State: {engine.engineState}
  Carried item: {engine.carriedItemIndex}
  Hovered item: {engine.hoveredItemIndex}
  MouseX: {engine.mouseX.toFixed(2)}
  MouseY: {engine.mouseY.toFixed(2)}
</p>

{#each engine.items as item, index}
  <div>
    Item {index}: {item.name}
    <p>{JSON.stringify(item.state, null, 2)}</p>
  </div>
{/each}
