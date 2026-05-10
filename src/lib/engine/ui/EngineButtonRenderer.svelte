<script lang="ts">
  import type { Item } from "../item.svelte"

  let { item }: { item: Item<any>; engine: any } = $props()
</script>

<div class="engine-button" aria-label={item.name}>
  {#if item.imageUrl}
    <img src={item.imageUrl} alt={item.name} class="item-image" />
  {/if}

  <span class="item-text">{item.name}</span>
</div>

<style>
.engine-button {
    width: 100%;
    height: 100%;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: #1a2a3c;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden; 
    gap: 0.15rem;
    padding: 0.1rem; 
    cursor: pointer;
  }


  .item-image {
    width: 72%;
    height: 72%;
    object-fit: contain; 
    image-rendering: pixelated;
    pointer-events: none;
  }

  .item-text {
    font-size: 0.95rem;
    line-height: 1.1;
    text-align: center;
    font-weight: 700;
  }
</style>
