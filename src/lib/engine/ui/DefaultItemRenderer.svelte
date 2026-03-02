<script lang="ts">
  import type { Item } from "../item.svelte"
  import type { Engine } from "../core.svelte"

  let { item, engine }: { item: Item<any>; engine: Engine } = $props()
</script>

<div class="item-body" style={item.draw(item.state)}></div>
<div class="item-label">{item.name}</div>

<style>
  .item-body {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .item-label {
    position: absolute;
    top: 105%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0.8rem;
    font-weight: bold;
    pointer-events: none;
    background: rgba(255, 255, 255, 0.7);
    padding: 2px 4px;
    border-radius: 4px;
  }
</style>
