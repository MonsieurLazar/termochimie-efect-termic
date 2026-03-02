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
