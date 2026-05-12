<script lang="ts">
  import type { Item } from "../item.svelte"
  import type { Engine } from "../core.svelte"

  let { item, engine }: { item: Item<any>; engine: Engine } = $props()
  const imageUrl = $derived(item.getDisplayImageUrl())
  const displayName = $derived(
    item.name === "Calorimetru" && item.state?.hasGlass && item.state?.hasThermometer
      ? "Calorimetru cu Berzelius si Termometru"
      : item.name === "Calorimetru" && item.state?.hasGlass
        ? "Calorimetru cu Berzelius"
        : item.name === "Calorimetru" && item.state?.hasThermometer
          ? "Calorimetru cu Termometru"
      : item.name,
  )
</script>

<div class="render-container">
  {#if item.color}
    <div
      class="bottle-fill"
      style="background-color: {item.color}; mask-image: url({imageUrl}); -webkit-mask-image: url({imageUrl});"
    ></div>
  {/if}

  {#if imageUrl}
    <img src={imageUrl} alt={item.name} class="bottle-overlay" />
  {/if}
</div>

<div class="item-label">{displayName} </div>
<style>
  .render-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bottle-fill {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
  }

  .bottle-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    pointer-events: none;
  }

  .item-label {
    position: absolute;
    top: 105%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0.8rem;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.7);
    padding: 2px 4px;
    border-radius: 4px;
  }
</style>
