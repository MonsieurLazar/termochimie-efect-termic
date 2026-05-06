<script lang="ts">
  import type { Engine } from "../core.svelte"

  let {
    engine,
    onClose = () => {},
    showCloseButton = true,
  }: { engine: Engine; onClose?: () => void; showCloseButton?: boolean } = $props()

  const width = 720
  const height = 240
  const padLeft = 44
  const padRight = 16
  const padTop = 16
  const padBottom = 28
  const hoverTagWidth = 144
  const hoverTagHeight = 24
  const hoverTagGap = 10
  const svgId = `main-glass-chart-${Math.random().toString(36).slice(2)}`

  let points = $derived(engine.mainGlassGraph.history)
  let hoveredIndex = $state<number | null>(null)

  let stats = $derived.by(() => {
    if (points.length === 0) {
      return {
        minT: 0,
        maxT: 100,
        firstTime: 0,
        lastTime: 1,
        currentTemp: null as number | null,
      }
    }

    const temperatures = points.map((p) => p.tempC)
    const minObserved = Math.min(...temperatures)
    const maxObserved = Math.max(...temperatures)
    const padding = 2

    const minT = Math.floor(minObserved - padding)
    const maxT = Math.ceil(maxObserved + padding)
    const firstTime = points[0].timeSec
    const lastTime = points[points.length - 1].timeSec

    return {
      minT,
      maxT: maxT === minT ? minT + 1 : maxT,
      firstTime,
      lastTime: lastTime === firstTime ? firstTime + 1 : lastTime,
      currentTemp: points[points.length - 1].tempC,
    }
  })

  let polylinePoints = $derived.by(() => {
    if (points.length === 0) return ""

    const plotWidth = width - padLeft - padRight
    const plotHeight = height - padTop - padBottom
    const timeSpan = stats.lastTime - stats.firstTime
    const tempSpan = stats.maxT - stats.minT

    return points
      .map((p) => {
        const normalizedX = (p.timeSec - stats.firstTime) / timeSpan
        const normalizedY = (p.tempC - stats.minT) / tempSpan
        const x = padLeft + normalizedX * plotWidth
        const y = height - padBottom - normalizedY * plotHeight
        return `${x},${y}`
      })
      .join(" ")
  })

  let yTicks = $derived.by(() => {
    const steps = 4
    return Array.from({ length: steps + 1 }, (_, i) => {
      const v = stats.minT + ((stats.maxT - stats.minT) * i) / steps
      return Math.round(v)
    })
  })

  let hoveredPoint = $derived.by(() => {
    if (hoveredIndex === null || hoveredIndex < 0 || hoveredIndex >= points.length) {
      return null
    }

    const p = points[hoveredIndex]
    const plotWidth = width - padLeft - padRight
    const plotHeight = height - padTop - padBottom
    const timeSpan = stats.lastTime - stats.firstTime
    const tempSpan = stats.maxT - stats.minT
    const normalizedX = (p.timeSec - stats.firstTime) / timeSpan
    const normalizedY = (p.tempC - stats.minT) / tempSpan

    return {
      x: padLeft + normalizedX * plotWidth,
      y: height - padBottom - normalizedY * plotHeight,
      timeSec: p.timeSec,
      tempC: p.tempC,
    }
  })

  let hoveredTagPosition = $derived.by(() => {
    if (!hoveredPoint) return null

    const halfTagWidth = hoverTagWidth / 2
    const minX = padLeft + halfTagWidth
    const maxX = width - padRight - halfTagWidth
    const x = Math.max(minX, Math.min(maxX, hoveredPoint.x))

    const preferredAboveY = hoveredPoint.y - hoverTagGap - hoverTagHeight
    const minY = padTop + 2
    const maxY = height - padBottom - hoverTagHeight - 2
    const y =
      preferredAboveY >= minY
        ? preferredAboveY
        : Math.min(maxY, hoveredPoint.y + hoverTagGap)

    return { x, y }
  })

  function handleMouseMove(event: MouseEvent) {
    if (points.length === 0) return
    const target = event.currentTarget as SVGSVGElement
    const rect = target.getBoundingClientRect()
    if (!rect.width) return

    const localX = ((event.clientX - rect.left) / rect.width) * width
    const clampedX = Math.max(padLeft, Math.min(width - padRight, localX))

    const plotWidth = width - padLeft - padRight
    const normalizedX = (clampedX - padLeft) / plotWidth
    const hoverTime = stats.firstTime + normalizedX * (stats.lastTime - stats.firstTime)

    let bestIndex = 0
    let bestDistance = Number.POSITIVE_INFINITY
    for (let i = 0; i < points.length; i += 1) {
      const dist = Math.abs(points[i].timeSec - hoverTime)
      if (dist < bestDistance) {
        bestDistance = dist
        bestIndex = i
      }
    }
    hoveredIndex = bestIndex
  }

  function clearHover() {
    hoveredIndex = null
  }

  function restartGraph() {
    engine.resetMainGlassTemperatureHistory()
    hoveredIndex = null
  }

  function togglePauseGraph() {
    engine.toggleMainGlassGraphPause()
  }
</script>

<section class="chart-wrap" aria-label="Main Glass temperature graph">
  <div class="header-row">
    <div class="chart-title">MAIN GLASS TEMPERATURE</div>
    <div class="toolbar">
      <button type="button" class="pause-btn" onclick={togglePauseGraph}>
        {engine.mainGlassGraph.isPaused ? "RESUME GRAPH" : "PAUSE GRAPH"}
      </button>
      <button type="button" class="restart-btn" onclick={restartGraph}>RESTART GRAPH</button>
      {#if showCloseButton}
        <button type="button" class="close-btn" onclick={onClose}>X</button>
      {/if}
    </div>
  </div>

  <svg
    id={svgId}
    viewBox={`0 0 ${width} ${height}`}
    role="img"
    onmousemove={handleMouseMove}
    onmouseleave={clearHover}
  >
    <rect x={padLeft} y={padTop} width={width - padLeft - padRight} height={height - padTop - padBottom} class="plot" />

    {#each yTicks as tick}
      {@const y = height - padBottom - ((tick - stats.minT) / (stats.maxT - stats.minT)) * (height - padTop - padBottom)}
      <line x1={padLeft} y1={y} x2={width - padRight} y2={y} class="grid" />
      <text x={padLeft - 8} y={y + 3} text-anchor="end" class="label">{tick}</text>
    {/each}

    <line x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} class="axis" />
    <line x1={padLeft} y1={padTop} x2={padLeft} y2={height - padBottom} class="axis" />

    {#if points.length > 1}
      <polyline points={polylinePoints} class="temp-line" />
    {/if}

    {#if hoveredPoint}
      <line
        x1={hoveredPoint.x}
        y1={padTop}
        x2={hoveredPoint.x}
        y2={height - padBottom}
        class="hover-line"
      />
      <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="4" class="hover-dot" />
      <g transform={`translate(${hoveredTagPosition?.x ?? hoveredPoint.x}, ${hoveredTagPosition?.y ?? hoveredPoint.y})`}>
        <rect
          x={-hoverTagWidth / 2}
          y="0"
          width={hoverTagWidth}
          height={hoverTagHeight}
          rx="2"
          ry="2"
          class="hover-tag-bg"
        />
        <text x="0" y={hoverTagHeight / 2 + 5} text-anchor="middle" class="hover-tag-text">
          {hoveredPoint.tempC.toFixed(1)}°C
        </text>
      </g>
    {/if}

    <text x={padLeft} y={height - 6} class="label">t={Math.max(0, Math.round(stats.firstTime))}s</text>
    <text x={width - padRight} y={height - 6} class="label" text-anchor="end">
      t={Math.max(0, Math.round(stats.lastTime))}s
    </text>
  </svg>

</section>

<style>
  .chart-wrap {
    margin-top: 0;
    border: 4px solid #23364a;
    background: #d7e7f4;
    box-shadow: 6px 6px 0 #8aa3ba;
    padding: 0.75rem;
    max-width: 760px;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
    flex-wrap: wrap;
  }

  .chart-title {
    color: #0f2537;
    letter-spacing: 1px;
    text-shadow: 1px 1px 0 #ffffff;
    font-size: 0.95rem;
  }

  .toolbar {
    display: flex;
    gap: 0.35rem;
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
  }

  .close-btn:hover {
    background: #ffd6d6;
  }

  .close-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #8a4a4a;
  }

  .pause-btn {
    border: 3px solid #23364a;
    background: #b9e7ff;
    color: #1a2a3c;
    padding: 0.2rem 0.5rem;
    font: inherit;
    font-size: 0.78rem;
    cursor: pointer;
    box-shadow: 2px 2px 0 #5a7f97;
  }

  .pause-btn:hover {
    background: #d0f0ff;
  }

  .pause-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #5a7f97;
  }

  .restart-btn {
    border: 3px solid #23364a;
    background: #f6e2a9;
    color: #1a2a3c;
    padding: 0.2rem 0.5rem;
    font: inherit;
    font-size: 0.78rem;
    cursor: pointer;
    box-shadow: 2px 2px 0 #7b6850;
  }

  .restart-btn:hover {
    background: #f9ebbe;
  }

  .restart-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #7b6850;
  }

  svg {
    width: 100%;
    display: block;
    background: #f5fbff;
    border: 3px solid #35526d;
    image-rendering: pixelated;
    shape-rendering: crispEdges;
  }

  .plot {
    fill: #ecf5fd;
  }

  .grid {
    stroke: #bfd4e6;
    stroke-width: 1;
  }

  .axis {
    stroke: #17334b;
    stroke-width: 2;
  }

  .temp-line {
    fill: none;
    stroke: #f0614a;
    stroke-width: 3;
    stroke-linejoin: bevel;
    stroke-linecap: square;
    filter: drop-shadow(1px 1px 0 #7d2416);
  }

  .hover-line {
    stroke: #7b3fb3;
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }

  .hover-dot {
    fill: #ffe56d;
    stroke: #4a2f08;
    stroke-width: 2;
  }

  .label {
    fill: #17334b;
    font-size: 21px;
    font-weight: 700;
    paint-order: stroke;
    stroke: #ecf5fd;
    stroke-width: 2px;
    stroke-linejoin: round;
  }

  .hover-tag-bg {
    fill: #fff3be;
    stroke: #4a2f08;
    stroke-width: 2;
  }

  .hover-tag-text {
    fill: #1a2a3c;
    font-size: 21px;
    font-weight: 700;
  }

  @media (max-width: 800px) {
    .chart-wrap {
      max-width: 100%;
    }
  }
</style>
