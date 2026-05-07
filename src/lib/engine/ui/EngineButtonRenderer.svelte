<script lang="ts">
  import type { Item } from "../item.svelte"

  let { item }: { item: Item<any>; engine: any } = $props()
</script>

<div class="engine-button" aria-label={item.name}>
  {item.name}
</div>

<style>
  .engine-button {
    width: 100%;
    height: 100%;
    border: 3px solid #23364a;
    background: #f6e2a9;
    box-shadow: 3px 3px 0 #7b6850;
    color: #1a2a3c;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 0.72rem;
    line-height: 1.1;
    padding: 0.2rem;
  }
</style>
