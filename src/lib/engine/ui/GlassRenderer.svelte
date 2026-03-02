<script lang="ts">
  import { onMount } from "svelte"
  import type { Item } from "../item.svelte"
  import type { Engine } from "../core.svelte"
  import { SUBSTANCES, type GlassState, AMBIENT_TEMPERATURE } from "../../index"

  let { item, engine }: { item: Item<GlassState>; engine: Engine } = $props()

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  let time = 0
  let animationFrame: number

  const render = () => {
    if (!ctx || !canvas) return
    time += 0.016

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const state = item.state
    const substances = state.substances
    const totalUnits = Object.values(substances).reduce((a, b) => a + b, 0)

    const fillLevel = Math.min(1, totalUnits / state.maxCapacity)

    // 1. Draw Glass Body (Outline)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
    ctx.lineWidth = 2
    ctx.strokeRect(5, 5, width - 10, height - 10)

    // 2. Sort substances by density (heaviest at bottom)
    const sorted = Object.entries(substances)
      .filter(([_, amount]) => amount > 0.001)
      .sort(
        ([a], [b]) =>
          (SUBSTANCES[b]?.density || 0) - (SUBSTANCES[a]?.density || 0),
      )

    // 3. Draw Layers
    let currentY = height - 5
    const availableHeight = (height - 10) * fillLevel

    sorted.forEach(([name, amount]) => {
      const meta = SUBSTANCES[name] || { color: "128, 128, 128", opacity: 0.5 }
      const layerHeight = (amount / totalUnits) * availableHeight

      ctx.fillStyle = `rgba(${meta.color}, ${meta.opacity})`
      ctx.fillRect(5, currentY - layerHeight, width - 10, layerHeight)

      // Interface shimmer
      if (state.reactionIntensity > 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * state.reactionIntensity})`
        ctx.fillRect(5, currentY - layerHeight - 1, width - 10, 2)
      }

      currentY -= layerHeight
    })

    // 4. Reaction Effects (Bubbles)
    if (state.reactionIntensity > 0.01) {
      const bubbleCount = Math.floor(state.reactionIntensity * 20)
      for (let i = 0; i < bubbleCount; i++) {
        const bx = 10 + Math.random() * (width - 20)
        const by = height - 10 - Math.random() * availableHeight
        const br = 1 + Math.random() * 2

        ctx.beginPath()
        ctx.arc(bx, by, br, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * state.reactionIntensity})`
        ctx.fill()
      }
    }

    // 5. Heat Glow (based on temp)
    const tempDiff = Math.max(0, state.temperatureC - AMBIENT_TEMPERATURE)
    if (tempDiff > 5) {
      const glow = Math.min(0.3, tempDiff / 100)
      ctx.shadowBlur = 15 * glow
      ctx.shadowColor = `rgba(255, 100, 0, ${glow})`
      ctx.strokeStyle = `rgba(255, 50, 0, ${glow})`
      ctx.lineWidth = 4
      ctx.strokeRect(2, 2, width - 4, height - 4)
      ctx.shadowBlur = 0
    }

    animationFrame = requestAnimationFrame(render)
  }

  onMount(() => {
    ctx = canvas.getContext("2d")!
    animationFrame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrame)
  })
</script>

<div class="glass-container">
  <canvas bind:this={canvas} width="100" height="200"></canvas>
  <div class="label-under">
    <div class="name">{item.name}</div>
    <div class="temp" class:hot={item.state.temperatureC > 40}>
      {item.state.temperatureC.toFixed(1)}°C
    </div>
    <div class="capacity">
      {Object.values(item.state.substances)
        .reduce((a, b) => a + b, 0)
        .toFixed(1)} / {item.state.maxCapacity}
    </div>
  </div>
</div>

<style>
  .glass-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  canvas {
    width: 100%;
    height: 100%;
    border-radius: 0 0 10px 10px;
    background: rgba(255, 255, 255, 0.3);
  }
  .label-under {
    position: absolute;
    top: 105%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    padding: 4px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .name {
    font-weight: bold;
    font-size: 0.8rem;
  }
  .temp {
    font-size: 0.9rem;
    color: #444;
  }
  .temp.hot {
    color: #e44d26;
    font-weight: bold;
  }
  .capacity {
    font-size: 0.7rem;
    color: #666;
  }
</style>
