<script lang="ts">
  import { onMount } from "svelte"
  import type { Item } from "../item.svelte"
  import type { Engine } from "../core.svelte"
  import { SUBSTANCES, type GlassState, AMBIENT_TEMPERATURE } from "../../index"

  let { item, engine }: { item: Item<GlassState>; engine: Engine } = $props()
  const imageUrl = $derived(item.getDisplayImageUrl())

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

    // 1. Draw Glass Body (Outline) - opțional acum că avem sprite
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
    ctx.lineWidth = 1
    ctx.strokeRect(2, 2, width - 4, height - 4)

    const sorted = Object.entries(substances)
      .filter(([_, amount]) => amount > 0.001)
      .sort(([a], [b]) => (SUBSTANCES[b]?.density || 0) - (SUBSTANCES[a]?.density || 0))

    let currentY = height - 5
    const availableHeight = (height - 10) * fillLevel
    const naoh_aq = (substances["NaOH_aq"] || 0)
    const hcl_aq = (substances["HCl_aq"] || 0)
    const hasIndicator = (substances["Indicator"] || 0) > 0.01
    const isBasic = naoh_aq > hcl_aq + 0.01
    const indicatorColor = (hasIndicator && isBasic) ? "255, 0, 150" : null

    sorted.forEach(([name, amount]) => {
      const meta = SUBSTANCES[name] || { color: "128, 128, 128", opacity: 0.5 }
      const layerHeight = (amount / totalUnits) * availableHeight
      let color = meta.color
      let opacity = meta.opacity

      if (indicatorColor && (name.includes("_aq") || name === "H2O" || name === "NaCl_aq")) {
        color = indicatorColor
        opacity = Math.max(opacity, 0.5)
      }

      ctx.fillStyle = `rgba(${color}, ${opacity})`
      ctx.fillRect(2, currentY - layerHeight, width - 4, layerHeight)
      currentY -= layerHeight
    })

    // 4. Reaction Effects (Bubbles)
    if (state.reactionIntensity > 0.01) {
      const bubbleCount = Math.floor(state.reactionIntensity * 15)
      for (let i = 0; i < bubbleCount; i++) {
        const bx = 5 + Math.random() * (width - 10)
        const by = height - 5 - Math.random() * availableHeight
        const br = 0.5 + Math.random() * 1.5
        ctx.beginPath()
        ctx.arc(bx, by, br, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * state.reactionIntensity})`
        ctx.fill()
      }
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
  <canvas 
    bind:this={canvas} 
    width="100" 
    height="200"
    style="mask-image: url({imageUrl}); -webkit-mask-image: url({imageUrl});"
  ></canvas>

  {#if imageUrl}
    <img src={imageUrl} alt="" class="glass-sprite" />
  {/if}

  <div class="label-under">
    <div class="name">{item.name}</div>
    <div class="capacity">
      {Object.values(item.state.substances).reduce((a, b) => a + b, 0).toFixed(1)} / {item.state.maxCapacity}
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
    position: relative; /* Necesar pentru poziționarea absolută a sprite-ului */
  }

  canvas {
    width: 100%;
    height: 100%;
    background: transparent !important;
    mask-size: contain;
    -webkit-mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-position: center;
  }

  .glass-sprite {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none; /* Să poți da click prin imagine pe obiect */
    z-index: 10;
    /* mix-blend-mode: multiply; -> opțional, dacă vrei ca reflexiile sprite-ului să se combine cu lichidul */
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
    white-space: nowrap;
  }
  .name {
    font-weight: bold;
    font-size: 0.8rem;
  }
  .capacity {
    font-size: 0.7rem;
    color: #666;
  }
</style>
