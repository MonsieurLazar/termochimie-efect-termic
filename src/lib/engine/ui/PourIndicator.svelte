<script lang="ts">
  import type { Item } from "../item.svelte"

  let { item, amount }: { item: Item<any>; amount: number } = $props()
</script>

<div
  class="pour-indicator"
  style:left="{item.position.x + item.dimension.width / 2}%"
  style:top="{item.position.y}%"
>
  {amount.toFixed(1)} units
</div>

<style>
  .pour-indicator {
    position: absolute;
    background: white;
    padding: 4px 8px;
    margin: 4px;
    border: 1px solid black;
    border-radius: 4px;
    pointer-events: none;
    transform: translate(-50%, -100%);
    font-size: 16px;
    font-weight: bold;
    z-index: 2000;
  }
</style>
