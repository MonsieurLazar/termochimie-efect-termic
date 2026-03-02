<script lang="ts">
  import { onMount } from "svelte"

  let { timeScale = $bindable(1) }: { timeScale: number } = $props()

  let experimentStartTime = new Date()
  let simulatedMs = $state(0)

  onMount(() => {
    experimentStartTime = new Date()
    const timer = setInterval(() => {
      simulatedMs += 1000 * timeScale
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  })

  let simulatedTime = $derived.by(() => {
    const time = new Date(experimentStartTime.getTime() + simulatedMs)
    return time.toLocaleTimeString('ro-RO', { hour12: false })
  })
</script>

<div class="timer-overlay">
  <div class="clock">{simulatedTime}</div>
  <div class="speed-controls">
    {#each [1, 2, 5, 10, 60] as speed}
      <button 
        class:active={timeScale === speed}
        onclick={() => timeScale = speed}
      >
        {speed}x
      </button>
    {/each}
  </div>
</div>

<style>
  .timer-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.75rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 140px;
    pointer-events: auto;
  }

  .clock {
    font-family: monospace;
    font-size: 1.5rem;
    font-weight: bold;
    color: #1a1a1a;
  }

  .speed-controls {
    display: flex;
    gap: 0.25rem;
  }

  .speed-controls button {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .speed-controls button:hover {
    background: #f3f4f6;
  }

  .speed-controls button.active {
    background: #3b82f6;
    color: white;
    border-color: #2563eb;
  }
</style>
