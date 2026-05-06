<script lang="ts">
  import { onMount } from "svelte"

  let {
    timeScale = $bindable(1),
    onClose = () => {},
  }: { timeScale: number; onClose?: () => void } = $props()

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

<section class="timer-widget" aria-label="Experiment timer">
  <div class="header-row">
    <div class="widget-title">EXPERIMENT TIMER</div>
    <div class="header-actions">
      <div class="clock">{simulatedTime}</div>
      <button type="button" class="close-btn" onclick={onClose}>X</button>
    </div>
  </div>

  <div class="speed-controls">
    {#each [1, 2, 5, 10, 60] as speed}
      <button
        class:active={timeScale === speed}
        onclick={() => (timeScale = speed)}
      >
        {speed}x
      </button>
    {/each}
  </div>
</section>

<style>
  .timer-widget {
    margin-top: 0;
    border: 4px solid #23364a;
    background: #d7e7f4;
    box-shadow: 6px 6px 0 #8aa3ba;
    padding: 0.75rem;
    max-width: 760px;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .widget-title {
    color: #0f2537;
    letter-spacing: 1px;
    text-shadow: 1px 1px 0 #ffffff;
    font-size: 0.95rem;
    line-height: 1;
  }

  .clock {
    font-size: 1.15rem;
    font-weight: bold;
    color: #17334b;
    background: #f5fbff;
    border: 3px solid #35526d;
    box-shadow: 2px 2px 0 #8aa3ba;
    padding: 0.2rem 0.45rem;
    line-height: 1;
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

  .speed-controls {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .speed-controls button {
    padding: 0.2rem 0.5rem;
    font: inherit;
    font-size: 0.78rem;
    border: 3px solid #23364a;
    background: #f5fbff;
    color: #1a2a3c;
    cursor: pointer;
    box-shadow: 2px 2px 0 #5a7f97;
  }

  .speed-controls button:hover {
    background: #e3f3ff;
  }

  .speed-controls button:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #5a7f97;
  }

  .speed-controls button.active {
    background: #f6e2a9;
    border-color: #7b6850;
    box-shadow: 2px 2px 0 #7b6850;
  }

  @media (max-width: 800px) {
    .timer-widget {
      max-width: 100%;
    }
  }
</style>
