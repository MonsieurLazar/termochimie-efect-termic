<script lang="ts">
  import { engine } from "$lib/index"
</script>

<p>
  Hovered item: {engine.hoveredItemIndex}
</p>

<section>
  {#each engine.items as item, index}
    <div
      role="cell"
      tabindex={index}
      style={item.getStyles()}
      onmouseenter={() => engine.markHoveredItem(index)}
      onmouseleave={() => engine.markHoveredItem(null)}
    >
      {item.name}
    </div>
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
