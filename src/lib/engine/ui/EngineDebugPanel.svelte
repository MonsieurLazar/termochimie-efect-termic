<script lang="ts">
  import { Engine } from "../core.svelte"

  let {
    engine,
    onClose = () => {},
    showCloseButton = true,
  }: { engine: Engine; onClose?: () => void; showCloseButton?: boolean } = $props()
</script>

<section class="debug-widget" aria-label="Engine debug stats">
  <div class="header-row">
    <div class="widget-title">DEBUG STATS</div>
    {#if showCloseButton}
      <button type="button" class="close-btn" onclick={onClose}>X</button>
    {/if}
  </div>

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
    margin-top: 0;
    border: 4px solid #23364a;
    background: #d7e7f4;
    box-shadow: 6px 6px 0 #8aa3ba;
    padding: 0.75rem;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .widget-title {
    color: #0f2537;
    letter-spacing: 1px;
    text-shadow: 1px 1px 0 #ffffff;
    font-size: 0.95rem;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .close-btn {
    border: 3px solid #23364a;
    background: #ffc7c7;
    color: #5a1515;
    padding: 0.2rem 0.45rem;
    font: inherit;
    font-size: 0.78rem;
    cursor: pointer;
    box-shadow: 2px 2px 0 #8a4a4a;
    line-height: 1;
  }

  .close-btn:hover {
    background: #ffd6d6;
  }

  .close-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #8a4a4a;
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

  .items-list {
    overflow-y: auto;
    padding-right: 0.2rem;
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

</style>
