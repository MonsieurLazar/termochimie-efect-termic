<script lang="ts">
  import { engine, TRANSFER_RATE } from "$lib/index"
  import { onMount } from "svelte"
  import EngineDebugPanel from "$lib/engine/ui/EngineDebugPanel.svelte"
  import PourIndicator from "$lib/engine/ui/PourIndicator.svelte"
  import ExperimentTimer from "$lib/engine/ui/ExperimentTimer.svelte"
  import MainGlassTemperatureChart from "$lib/engine/ui/MainGlassTemperatureChart.svelte"
  import type { WidgetKey } from "$lib/engine/core.svelte"
  import CalculatorContent from "$lib/widgets/CalculatorContent.svelte"
  import TheoryContent from "$lib/widgets/TheoryContent.svelte"

  let parentElement: HTMLElement | null = null

  let widgetPosition = $state<Record<WidgetKey, { x: number; y: number }>>({
    graph: { x: 20, y: 20 },
    timer: { x: 36, y: 90 },
    debug: { x: 52, y: 160 },
    calculator: { x: 120, y: 48 },
    theory: { x: 160, y: 72 },
  })
  let widgetZ = $state<Record<WidgetKey, number>>({
    graph: 3,
    timer: 2,
    debug: 1,
    calculator: 4,
    theory: 5,
  })
  let nextZ = $state(6)
  let previousWidgetVisibility = $state<Record<WidgetKey, boolean>>({
    graph: false,
    timer: false,
    debug: false,
    calculator: false,
    theory: false,
  })
  let dragState = $state<{
    widget: WidgetKey
    offsetX: number
    offsetY: number
  } | null>(null)
  let ignoreNextReleaseClick = $state(false)
  let hoveredWidgets = $state<Record<WidgetKey, boolean>>({
    graph: false,
    timer: false,
    debug: false,
    calculator: false,
    theory: false,
  })

  const baseWidgetWidthPx = 760

  function getWidgetBaseWidthPx(widget: WidgetKey) {
    const scale =
      widget === "graph"
        ? 0.8
        : widget === "timer"
          ? 0.3
          : widget === "debug"
            ? 0.75
            : widget === "calculator"
              ? 1
              : 0.9
    return Math.round(baseWidgetWidthPx * scale)
  }

  function getWidgetWidthPx(widget: WidgetKey) {
    return Math.min(
      getWidgetBaseWidthPx(widget),
      Math.max(0, window.innerWidth - 16),
    )
  }

  function getWidgetHeightPx(widget: WidgetKey) {
    const element = document.getElementById(`widget-${widget}`)
    if (!element) return 120
    return Math.max(120, Math.round(element.getBoundingClientRect().height))
  }

  function getWidgetWidth(widget: WidgetKey) {
    const widthPx = getWidgetBaseWidthPx(widget)
    return `min(${widthPx}px, calc(100vw - 2rem))`
  }

  onMount(() => {
    const cleanup = engine.init(parentElement!)

    const onMouseMove = (event: MouseEvent) => {
      if (!dragState) return
      const widgetWidth = getWidgetWidthPx(dragState.widget)
      const widgetHeight = getWidgetHeightPx(dragState.widget)
      const maxX = Math.max(8, window.innerWidth - widgetWidth - 8)
      const maxY = Math.max(8, window.innerHeight - widgetHeight - 8)
      widgetPosition[dragState.widget] = {
        x: Math.max(8, Math.min(maxX, event.clientX - dragState.offsetX)),
        y: Math.max(8, Math.min(maxY, event.clientY - dragState.offsetY)),
      }
    }

    const onClickRelease = () => {
      if (!dragState) return
      if (ignoreNextReleaseClick) {
        ignoreNextReleaseClick = false
        return
      }
      dragState = null
      if (!isAnyWidgetHovered()) {
        engine.setUiInteractionLock(false)
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("click", onClickRelease)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("click", onClickRelease)
      cleanup()
    }
  })

  function focusWidget(widget: WidgetKey) {
    widgetZ[widget] = nextZ
    nextZ += 1
  }

  function isAnyWidgetHovered() {
    return Object.values(hoveredWidgets).some(Boolean)
  }

  $effect(() => {
    const widgets: WidgetKey[] = [
      "graph",
      "timer",
      "debug",
      "calculator",
      "theory",
    ]

    for (const widget of widgets) {
      const isVisible = engine.widgetVisibility[widget]
      const wasVisible = previousWidgetVisibility[widget]
      if (isVisible && !wasVisible) {
        focusWidget(widget)
      }
      previousWidgetVisibility[widget] = isVisible
    }
  })

  function startDrag(widget: WidgetKey, event: MouseEvent) {
    event.stopPropagation()

    if (dragState?.widget === widget) {
      dragState = null
      if (!isAnyWidgetHovered()) {
        engine.setUiInteractionLock(false)
      }
      return
    }

    focusWidget(widget)
    dragState = {
      widget,
      offsetX: event.clientX - widgetPosition[widget].x,
      offsetY: event.clientY - widgetPosition[widget].y,
    }
    ignoreNextReleaseClick = true
    engine.setUiInteractionLock(true)
  }

  function closeWidget(widget: WidgetKey) {
    hoveredWidgets[widget] = false
    if (dragState?.widget === widget) {
      dragState = null
    }
    engine.closeWidget(widget)
    if (!dragState && !isAnyWidgetHovered()) {
      engine.setUiInteractionLock(false)
    }
  }

  function beginWidgetHover(widget: WidgetKey) {
    hoveredWidgets[widget] = true
    engine.clearHoveredState()
    engine.setUiInteractionLock(true)
  }

  function endWidgetHover(widget: WidgetKey) {
    hoveredWidgets[widget] = false
    if (!dragState && !isAnyWidgetHovered()) {
      engine.setUiInteractionLock(false)
    }
  }

  let cursor = $derived.by(() => {
    if (dragState) return "grabbing"
    if (engine.engineState === "idle" && engine.hoveredItemIndex !== null) {
      const hovered = engine.items[engine.hoveredItemIndex]
      if (hovered.kind === "ui-button") return "pointer"
      return "grab"
    }
    if (engine.engineState !== "idle") return "grabbing"
    return "default"
  })
</script>

<section
  bind:this={parentElement}
  class:is-idle={engine.engineState === "idle"}
  class:is-carrying={engine.engineState === "carrying"}
  class:is-pouring={engine.engineState === "pouring"}
  style:cursor
>
  {#each engine.items as item}
    {#if engine.isItemVisible(item)}
      <div style={item.getStyles()}>
        <item.renderComponent {item} {engine} />
      </div>
    {/if}
  {/each}

  {#if engine.engineState === "pouring" && engine.carriedItemIndex !== null}
    <PourIndicator
      item={engine.items[engine.carriedItemIndex]}
      amount={engine.pouringAmount * TRANSFER_RATE}
    />
  {/if}
</section>

{#if engine.widgetVisibility.graph}
  <div
    id="widget-graph"
    class="desktop-window"
    role="dialog"
    aria-label="Graph widget"
    tabindex="-1"
    style:left={`${widgetPosition.graph.x}px`}
    style:top={`${widgetPosition.graph.y}px`}
    style:z-index={10000 + widgetZ.graph}
    style:width={getWidgetWidth("graph")}
    onmouseenter={() => beginWidgetHover("graph")}
    onmouseleave={() => endWidgetHover("graph")}
  >
    <div class="desktop-topbar">
      <button
        type="button"
        class="desktop-tab"
        class:is-dragging={dragState?.widget === "graph"}
        onclick={(event) => startDrag("graph", event)}
      >
        Graph
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("graph")}>X</button
      >
    </div>
    <MainGlassTemperatureChart {engine} showCloseButton={false} />
  </div>
{/if}

{#if engine.widgetVisibility.timer}
  <div
    id="widget-timer"
    class="desktop-window"
    role="dialog"
    aria-label="Timer widget"
    tabindex="-1"
    style:left={`${widgetPosition.timer.x}px`}
    style:top={`${widgetPosition.timer.y}px`}
    style:z-index={10000 + widgetZ.timer}
    style:width={getWidgetWidth("timer")}
    onmouseenter={() => beginWidgetHover("timer")}
    onmouseleave={() => endWidgetHover("timer")}
  >
    <div class="desktop-topbar">
      <button
        type="button"
        class="desktop-tab"
        class:is-dragging={dragState?.widget === "timer"}
        onclick={(event) => startDrag("timer", event)}
      >
        Timer
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("timer")}>X</button
      >
    </div>
    <ExperimentTimer bind:timeScale={engine.timeScale} showCloseButton={false} />
  </div>
{/if}

{#if engine.widgetVisibility.debug}
  <div
    id="widget-debug"
    class="desktop-window"
    role="dialog"
    aria-label="Debug widget"
    tabindex="-1"
    style:left={`${widgetPosition.debug.x}px`}
    style:top={`${widgetPosition.debug.y}px`}
    style:z-index={10000 + widgetZ.debug}
    style:width={getWidgetWidth("debug")}
    onmouseenter={() => beginWidgetHover("debug")}
    onmouseleave={() => endWidgetHover("debug")}
  >
    <div class="desktop-topbar">
      <button
        type="button"
        class="desktop-tab"
        class:is-dragging={dragState?.widget === "debug"}
        onclick={(event) => startDrag("debug", event)}
      >
        Debug
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("debug")}>X</button
      >
    </div>
    <EngineDebugPanel {engine} showCloseButton={false} />
  </div>
{/if}

{#if engine.widgetVisibility.calculator}
  <div
    id="widget-calculator"
    class="desktop-window"
    role="dialog"
    aria-label="Calculator widget"
    tabindex="-1"
    style:left={`${widgetPosition.calculator.x}px`}
    style:top={`${widgetPosition.calculator.y}px`}
    style:z-index={10000 + widgetZ.calculator}
    style:width={getWidgetWidth("calculator")}
    onmouseenter={() => beginWidgetHover("calculator")}
    onmouseleave={() => endWidgetHover("calculator")}
  >
    <div class="desktop-topbar">
      <button
        type="button"
        class="desktop-tab"
        class:is-dragging={dragState?.widget === "calculator"}
        onclick={(event) => startDrag("calculator", event)}
      >
        Calculator
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("calculator")}>X</button
      >
    </div>
    <div class="external-widget-content">
      <CalculatorContent />
    </div>
  </div>
{/if}

{#if engine.widgetVisibility.theory}
  <div
    id="widget-theory"
    class="desktop-window"
    role="dialog"
    aria-label="Theory widget"
    tabindex="-1"
    style:left={`${widgetPosition.theory.x}px`}
    style:top={`${widgetPosition.theory.y}px`}
    style:z-index={10000 + widgetZ.theory}
    style:width={getWidgetWidth("theory")}
    onmouseenter={() => beginWidgetHover("theory")}
    onmouseleave={() => endWidgetHover("theory")}
  >
    <div class="desktop-topbar">
      <button
        type="button"
        class="desktop-tab"
        class:is-dragging={dragState?.widget === "theory"}
        onclick={(event) => startDrag("theory", event)}
      >
        Theory
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("theory")}>X</button
      >
    </div>
    <div class="external-widget-content">
      <TheoryContent />
    </div>
  </div>
{/if}

<style>
  :global(.main) {
    padding: 0;
  }

  section {
    border: 1px solid black;
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .desktop-window {
    position: fixed;
    z-index: 2000;
    max-height: calc(100vh - 1rem);
    overflow-y: auto;
  }

  .desktop-topbar {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    gap: 0.35rem;
  }

  .desktop-tab {
    border: 3px solid #23364a;
    border-bottom: none;
    background: #f6e2a9;
    color: #1a2a3c;
    box-shadow: 3px 0 0 #7b6850;
    font: inherit;
    font-size: 0.8rem;
    padding: 0.2rem 0.7rem;
    cursor: grab;
    line-height: 1;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    flex: 1;
    text-align: left;
  }

  .desktop-tab:active,
  .desktop-tab.is-dragging {
    cursor: grabbing;
  }

  .desktop-close {
    border: 3px solid #23364a;
    border-bottom: none;
    background: #ffc7c7;
    color: #5a1515;
    box-shadow: 3px 0 0 #8a4a4a;
    font: inherit;
    font-size: 0.78rem;
    padding: 0.2rem 0.5rem;
    cursor: pointer;
    line-height: 1;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  .external-widget-content {
    border: 4px solid #23364a;
    background: #d7e7f4;
    box-shadow: 6px 6px 0 #8aa3ba;
    height: min(75vh, 760px);
    overflow: auto;
    padding: 0.75rem;
  }
</style>
