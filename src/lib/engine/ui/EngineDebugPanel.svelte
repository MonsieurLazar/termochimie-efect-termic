<script lang="ts">
  import { Engine } from "../core.svelte"

  let { engine }: { engine: Engine } = $props()
</script>

<section class="debug-widget" aria-label="Engine debug stats">
  <div class="widget-title">DEBUG STATS</div>

  <div class="stats-grid">
    <div><strong>State:</strong> {engine.engineState}</div>
    <div><strong>Carried:</strong> {engine.carriedItemIndex ?? "none"}</div>
    <div><strong>Hovered:</strong> {engine.hoveredItemIndex ?? "none"}</div>
    <div><strong>MouseX:</strong> {engine.mouseX.toFixed(2)}</div>
    <div><strong>MouseY:</strong> {engine.mouseY.toFixed(2)}</div>
    <div><strong>Time Scale:</strong> {engine.timeScale}x</div>
  </div>

  <div class="items-list">
    {#each engine.items as item, index}
      <details>
        <summary>Item {index}: {item.name}</summary>
        <pre>{JSON.stringify(item.state, null, 2)}</pre>
      </details>
    {/each}
  </div>
</section>

<style>
  .debug-widget {
    margin-top: 1rem;
    border: 4px solid #23364a;
    background: #d7e7f4;
    box-shadow: 6px 6px 0 #8aa3ba;
    padding: 0.75rem;
    max-width: 760px;
  }

  .widget-title {
    color: #0f2537;
    letter-spacing: 1px;
    text-shadow: 1px 1px 0 #ffffff;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.35rem 0.6rem;
    margin-bottom: 0.6rem;
    color: #17334b;
    font-size: 0.8rem;
  }

  .items-list details {
    border: 3px solid #35526d;
    background: #f5fbff;
    margin-top: 0.4rem;
    box-shadow: 2px 2px 0 #8aa3ba;
  }

  .items-list summary {
    cursor: pointer;
    padding: 0.25rem 0.4rem;
    color: #17334b;
    font-size: 0.8rem;
    user-select: none;
  }

  .items-list pre {
    margin: 0;
    padding: 0.45rem;
    border-top: 2px solid #bfd4e6;
    font-size: 0.7rem;
    line-height: 1.3;
    color: #1a2a3c;
    white-space: pre-wrap;
    word-break: break-word;
  }

  @media (max-width: 800px) {
    .debug-widget {
      max-width: 100%;
    }
  }
</style>
