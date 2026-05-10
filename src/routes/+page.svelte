<script lang="ts">
  import { AMBIENT_TEMPERATURE, engine, setTestTubeRequirements, TRANSFER_RATE, type TestTubeRequirement } from "$lib/index"
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
  let resizeState = $state<{
    widget: WidgetKey
    corner: "left" | "right"
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    startLeft: number
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

  function getViewportWidth() {
    return typeof window === "undefined" ? 1280 : window.innerWidth
  }

  function getWidgetBaseWidthPx(widget: WidgetKey) {
    const scale =
      widget === "graph"
        ? 0.8
        : widget === "timer"
          ? 0.3
          : widget === "debug"
            ? 0.75
            : widget === "calculator"
              ? 1.25
              : 0.9
    return Math.round(baseWidgetWidthPx * scale)
  }

  function getWidgetWidthPx(widget: WidgetKey) {
    return Math.min(
      getWidgetBaseWidthPx(widget),
      Math.max(0, getViewportWidth() - 16),
    )
  }

  function getWidgetBaseHeightPx(widget: WidgetKey) {
    return widget === "timer" ? 220 : widget === "graph" ? 420 : 520
  }

  let widgetSize = $state<Record<WidgetKey, { width: number; height: number }>>({
    graph: { width: getWidgetWidthPx("graph"), height: getWidgetBaseHeightPx("graph") },
    timer: { width: getWidgetWidthPx("timer"), height: getWidgetBaseHeightPx("timer") },
    debug: { width: getWidgetWidthPx("debug"), height: getWidgetBaseHeightPx("debug") },
    calculator: { width: getWidgetWidthPx("calculator"), height: getWidgetBaseHeightPx("calculator") },
    theory: { width: getWidgetWidthPx("theory"), height: getWidgetBaseHeightPx("theory") },
  })

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
      if (resizeState) {
        const minWidth = 260
        const minHeight = 180
        const maxWidth = Math.max(minWidth, window.innerWidth - 16)
        const maxHeight = Math.max(minHeight, window.innerHeight - 16)
        const deltaX = event.clientX - resizeState.startX
        const deltaY = event.clientY - resizeState.startY

        if (resizeState.corner === "right") {
          const nextWidth = Math.max(
            minWidth,
            Math.min(maxWidth, resizeState.startWidth + deltaX),
          )
          widgetSize[resizeState.widget].width = nextWidth
        } else {
          const nextWidth = Math.max(
            minWidth,
            Math.min(maxWidth, resizeState.startWidth - deltaX),
          )
          const rightEdge = resizeState.startLeft + resizeState.startWidth
          const nextLeft = Math.max(8, rightEdge - nextWidth)
          widgetSize[resizeState.widget].width = nextWidth
          widgetPosition[resizeState.widget].x = nextLeft
        }

        const nextHeight = Math.max(
          minHeight,
          Math.min(maxHeight, resizeState.startHeight + deltaY),
        )
        widgetSize[resizeState.widget].height = nextHeight
        return
      }

      if (!dragState) return
      const widgetWidth = widgetSize[dragState.widget].width
      const widgetHeight = widgetSize[dragState.widget].height
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

    const onMouseUp = () => {
      if (!resizeState) return
      resizeState = null
      if (!dragState && !isAnyWidgetHovered()) {
        engine.setUiInteractionLock(false)
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("click", onClickRelease)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("click", onClickRelease)
      window.removeEventListener("mouseup", onMouseUp)
      cleanup()
    }
  })

  function startResize(widget: WidgetKey, corner: "left" | "right", event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    focusWidget(widget)
    const current = widgetSize[widget]
    resizeState = {
      widget,
      corner,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: current.width,
      startHeight: current.height,
      startLeft: widgetPosition[widget].x,
    }
    engine.setUiInteractionLock(true)
  }

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

  let measuredTemperatureC = $state("")
  let isStagnationSubmitted = $state(false)
  let hasOpenedTheory = $state(false)
  let currentExperimentIndex = $state(0)
  let measuredResults = $state<
    { reaction: string; measuredTempC: number }[]
  >([])

  const experiments: {
    reaction: string
    requirements: Record<string, TestTubeRequirement>
    skipSubstances: Record<string, Record<string, number>>
    pourTubes: string[]
  }[] = [
    {
      reaction: "HCl + NaOH",
      requirements: {
        "Eprubeta HCl": { requiredSubstance: "HCl_aq", requiredVolume: 25, label: "25 ml HCl" },
        "Eprubeta NaOH": { requiredSubstance: "NaOH_aq", requiredVolume: 50, label: "50 ml NaOH" },
        "Eprubeta H2SO4": { label: "nefolosita in acest pas" },
        "Eprubeta NH4OH": { label: "nefolosita in acest pas" },
      },
      skipSubstances: {
        "Eprubeta HCl": { HCl_aq: 7.5, H2O: 17.5 },
        "Eprubeta NaOH": { NaOH_aq: 15, H2O: 35 },
      },
      pourTubes: ["Eprubeta HCl", "Eprubeta NaOH"],
    },
    {
      reaction: "H2SO4 + NaOH",
      requirements: {
        "Eprubeta HCl": { label: "nefolosita in acest pas" },
        "Eprubeta NaOH": { requiredSubstance: "NaOH_aq", requiredVolume: 50, label: "50 ml NaOH" },
        "Eprubeta H2SO4": { requiredSubstance: "H2SO4_aq", requiredVolume: 25, label: "25 ml H2SO4" },
        "Eprubeta NH4OH": { label: "nefolosita in acest pas" },
      },
      skipSubstances: {
        "Eprubeta H2SO4": { H2SO4_aq: 7.5, H2O: 17.5 },
        "Eprubeta NaOH": { NaOH_aq: 15, H2O: 35 },
      },
      pourTubes: ["Eprubeta H2SO4", "Eprubeta NaOH"],
    },
    {
      reaction: "HCl + NH4OH",
      requirements: {
        "Eprubeta HCl": { requiredSubstance: "HCl_aq", requiredVolume: 25, label: "25 ml HCl" },
        "Eprubeta NaOH": { label: "nefolosita in acest pas" },
        "Eprubeta H2SO4": { label: "nefolosita in acest pas" },
        "Eprubeta NH4OH": { requiredSubstance: "NH4OH_aq", requiredVolume: 50, label: "50 ml NH4OH" },
      },
      skipSubstances: {
        "Eprubeta HCl": { HCl_aq: 7.5, H2O: 17.5 },
        "Eprubeta NH4OH": { NH4OH_aq: 15, H2O: 35 },
      },
      pourTubes: ["Eprubeta HCl", "Eprubeta NH4OH"],
    },
  ]

  const currentExperiment = $derived(experiments[currentExperimentIndex])

  $effect(() => {
    setTestTubeRequirements(currentExperiment.requirements)
  })

  $effect(() => {
    if (engine.widgetVisibility.theory) hasOpenedTheory = true
  })

  const cleaningItemNames = ["Berzelius", "Eprubeta NaOH", "Eprubeta HCl", "Eprubeta H2SO4", "Eprubeta NH4OH"]
  const cleanItems = $derived(
    engine.items.filter((item) => cleaningItemNames.includes(item.name)),
  )
  const dirtyCleanItems = $derived(
    cleanItems.filter((item) => item.state?.isDirty),
  )
  const isCleaningStepComplete = $derived(dirtyCleanItems.length === 0)
  const mainGlass = $derived(engine.items.find((item) => item.name === "Calorimetru"))
  const hasSecondaryGlassInMain = $derived(mainGlass?.state?.hasGlass === true)
  const testTubeItems = $derived(
    engine.items.filter((item) => ["Eprubeta NaOH", "Eprubeta HCl", "Eprubeta H2SO4", "Eprubeta NH4OH"].includes(item.name)),
  )
  function getRequirementValidation(tubeName: string, requirement: TestTubeRequirement) {
    if (!requirement.requiredSubstance || !requirement.requiredVolume) {
      return {
        ...requirement,
        isComplete: true,
        isValid: true,
        message: "Curata si las-o goala pentru acest experiment.",
      }
    }

    const tube = getItem(tubeName)
    if (!tube) {
      return {
        ...requirement,
        isComplete: false,
        isValid: false,
        message: "Eprubeta lipseste.",
      }
    }

    const substances = tube.state.substances
    const totalAmount = Object.values(substances).reduce(
      (sum: number, amount: number) => sum + amount,
      0,
    )
    const requiredAmount = substances[requirement.requiredSubstance] || 0
    const hasForeignSubstances = Object.entries(substances).some(
      ([name, amount]) =>
        amount > 0.01 && name !== requirement.requiredSubstance && name !== "H2O",
    )

    if (hasForeignSubstances) {
      return {
        ...requirement,
        isComplete: false,
        isValid: false,
        message: "Substanta gresita. Goleste la Gunoi si reia.",
      }
    }

    if (requiredAmount <= 0.01) {
      return {
        ...requirement,
        isComplete: false,
        isValid: true,
        message: `Toarna ${requirement.label}.`,
      }
    }

    const isValid = Math.abs(totalAmount - requirement.requiredVolume) <= 2

    return {
      ...requirement,
      isComplete: isValid,
      isValid,
      message: isValid
        ? `Corect: ${totalAmount.toFixed(1)} ml.`
        : `Cantitate gresita: ai ${totalAmount.toFixed(1)} ml, trebuie ${requirement.requiredVolume} ml. Goleste la Gunoi si reia.`,
    }
  }

  const testTubeValidations = $derived(
    testTubeItems.map((item) => ({
      item,
      validation: getRequirementValidation(item.name, currentExperiment.requirements[item.name]),
    })),
  )

  function isRequirementComplete(tubeName: string, requirement: TestTubeRequirement) {
    const validation = getRequirementValidation(tubeName, requirement)

    return validation.isComplete
  }

  const areTestTubeReactionsComplete = $derived(
    Object.entries(currentExperiment.requirements)
      .filter(([, requirement]) => requirement.requiredSubstance)
      .every(([tubeName, requirement]) => isRequirementComplete(tubeName, requirement)),
  )
  const isGraphStepComplete = $derived(engine.widgetVisibility.graph)
  const isCalorimeterPourComplete = $derived(
    currentExperiment.pourTubes.every((tubeName) => {
      if (tubeName === "Eprubeta HCl") return mainGlass?.state?.receivedHClTube === true
      if (tubeName === "Eprubeta NaOH") return mainGlass?.state?.receivedNaOHTube === true
      if (tubeName === "Eprubeta H2SO4") return mainGlass?.state?.receivedH2SO4Tube === true
      if (tubeName === "Eprubeta NH4OH") return mainGlass?.state?.receivedNH4OHTube === true
      return false
    }),
  )
  const isCalorimeterEmpty = $derived(
    Object.values(mainGlass?.state?.substances || {}).reduce<number>(
      (sum: number, amount: number) => sum + amount,
      0,
    ) <= 0.01,
  )
  let guideStep = $state(0)
  const displayedGuideStep = $derived.by(() => {
    if (guideStep <= 2) return guideStep
    if (guideStep === 8) return 3 + experiments.length * 5
    return 3 + currentExperimentIndex * 5 + (guideStep - 3)
  })

  $effect(() => {
    if (guideStep === 0 && hasOpenedTheory) {
      guideStep = 1
    } else if (guideStep === 1 && isCleaningStepComplete) {
      guideStep = 2
    } else if (guideStep === 2 && hasSecondaryGlassInMain) {
      guideStep = 3
    } else if (guideStep === 3 && areTestTubeReactionsComplete) {
      guideStep = 4
    } else if (guideStep === 4 && isGraphStepComplete) {
      guideStep = 5
    } else if (guideStep === 5 && isCalorimeterPourComplete) {
      guideStep = 6
    } else if (guideStep === 7 && isCalorimeterEmpty) {
      if (currentExperimentIndex < experiments.length - 1) {
        currentExperimentIndex += 1
        resetExperimentVessels()
        guideStep = 3
      } else {
        guideStep = 8
      }
    }
  })

  function getItem(name: string) {
    return engine.items.find((item) => item.name === name)
  }

  function emptyIntoCalorimeter(sourceName: string) {
    const source = getItem(sourceName)
    const calorimeter = getItem("Calorimetru")
    if (!source || !calorimeter) return

    const sourceTotal = Object.values(source.state.substances).reduce(
      (sum: number, amount: number) => sum + amount,
      0,
    )
    if (sourceTotal <= 0) return

    const targetTotal = Object.values(calorimeter.state.substances).reduce(
      (sum: number, amount: number) => sum + amount,
      0,
    )
    const newTargetTotal = targetTotal + sourceTotal

    calorimeter.state.temperatureC =
      (calorimeter.state.temperatureC * targetTotal +
        source.state.temperatureC * sourceTotal) /
      newTargetTotal

    Object.entries(source.state.substances).forEach(([name, amount]) => {
      calorimeter.state.substances[name] =
        (calorimeter.state.substances[name] || 0) + amount
    })
    source.state.substances = {}

    if (sourceName === "Eprubeta HCl") calorimeter.state.receivedHClTube = true
    if (sourceName === "Eprubeta NaOH") calorimeter.state.receivedNaOHTube = true
    if (sourceName === "Eprubeta H2SO4") calorimeter.state.receivedH2SO4Tube = true
    if (sourceName === "Eprubeta NH4OH") calorimeter.state.receivedNH4OHTube = true
  }

  function resetExperimentVessels() {
    cleanItems.forEach((item) => {
      item.state.substances = {}
      item.state.temperatureC = AMBIENT_TEMPERATURE
      item.state.reactionIntensity = 0
      item.state.isDirty = false
      item.state.rinseUnits = 0
    })

    const calorimeter = getItem("Calorimetru")
    if (calorimeter) {
      calorimeter.state.temperatureC = AMBIENT_TEMPERATURE
      calorimeter.state.reactionIntensity = 0
      calorimeter.state.receivedHClTube = false
      calorimeter.state.receivedNaOHTube = false
      calorimeter.state.receivedH2SO4Tube = false
      calorimeter.state.receivedNH4OHTube = false
      calorimeter.state.hasGlass = true
    }

    measuredTemperatureC = ""
    isStagnationSubmitted = false
    engine.closeWidget("graph")
  }

  function skipGuideStep() {
    if (guideStep === 0) {
      hasOpenedTheory = true
      engine.openWidget("theory")
      guideStep = 1
      return
    }

    if (guideStep === 1) {
      cleanItems.forEach((item) => {
        item.state.substances = {}
        item.state.isDirty = false
        item.state.rinseUnits = 0
      })
      guideStep = 2
      return
    }

    if (guideStep === 2) {
      const berzelius = getItem("Berzelius")
      const calorimeter = getItem("Calorimetru")
      if (calorimeter) calorimeter.state.hasGlass = true
      if (berzelius) berzelius.state.isHidden = true
      guideStep = 3
      return
    }

    if (guideStep === 3) {
      Object.entries(currentExperiment.skipSubstances).forEach(([tubeName, substances]) => {
        const tube = getItem(tubeName)
        if (tube) tube.state.substances = { ...substances }
      })
      guideStep = 4
      return
    }

    if (guideStep === 4) {
      engine.openWidget("graph")
      guideStep = 5
      return
    }

    if (guideStep === 5) {
      currentExperiment.pourTubes.forEach((tubeName) => emptyIntoCalorimeter(tubeName))
      guideStep = 6
      return
    }

    if (guideStep === 6) {
      if (!measuredTemperatureC) {
        measuredTemperatureC = String(Number(mainGlass?.state?.temperatureC ?? AMBIENT_TEMPERATURE).toFixed(1))
      }
      submitMeasuredTemperature()
      return
    }

    if (guideStep === 7) {
      const calorimeter = getItem("Calorimetru")
      if (calorimeter) {
        calorimeter.state.substances = {}
        calorimeter.state.temperatureC = AMBIENT_TEMPERATURE
        calorimeter.state.reactionIntensity = 0
      }
      return
    }
  }

  function resetExperimentFlow() {
    cleanItems.forEach((item) => {
      item.state.substances = {}
      item.state.temperatureC = AMBIENT_TEMPERATURE
      item.state.reactionIntensity = 0
      item.state.isDirty = true
      item.state.rinseUnits = 0
      item.state.isHidden = false
    })

    const calorimeter = getItem("Calorimetru")
    if (calorimeter) {
      calorimeter.state.substances = {}
      calorimeter.state.temperatureC = AMBIENT_TEMPERATURE
      calorimeter.state.reactionIntensity = 0
      calorimeter.state.hasGlass = false
      calorimeter.state.receivedHClTube = false
      calorimeter.state.receivedNaOHTube = false
      calorimeter.state.receivedH2SO4Tube = false
      calorimeter.state.receivedNH4OHTube = false
    }

    measuredTemperatureC = ""
    isStagnationSubmitted = false
    hasOpenedTheory = false
    currentExperimentIndex = 0
    measuredResults = []
    engine.closeWidget("graph")
    guideStep = 0
  }

  function submitMeasuredTemperature() {
    const measuredTempC = Number(measuredTemperatureC)
    if (!Number.isFinite(measuredTempC)) return
    measuredResults = [
      ...measuredResults,
      { reaction: currentExperiment.reaction, measuredTempC },
    ]
    isStagnationSubmitted = true
    guideStep = 7
  }
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

<aside class="experiment-guide" aria-label="Experiment guide">
  <div class="guide-title">Ghid experiment</div>
  <div class="guide-step-row">
    <div class="guide-step">Pas {displayedGuideStep}</div>
    {#if guideStep < 8}
      <button type="button" class="guide-skip" onclick={skipGuideStep}>Skip pas</button>
    {:else}
      <button type="button" class="guide-skip" onclick={resetExperimentFlow}>Reseteaza</button>
    {/if}
  </div>
  {#if guideStep === 0}
    <p>Deschide Teorie si citeste instructiunile inainte de experiment.</p>
  {:else if guideStep === 1}
    <p>Toarna 10-15 unitati de apa distilata in fiecare vas murdar, apoi goleste-l la Gunoi.</p>
    <div class="guide-list">
      {#each cleanItems as item}
        <span class:done={!item.state?.isDirty}>
          {item.name}: {item.state?.isDirty ? `murdar (${(item.state?.rinseUnits || 0).toFixed(1)} / 10 apa)` : "curat"}
        </span>
      {/each}
    </div>
  {:else if guideStep === 2}
    <p>Vasele sunt curate. Pune Berzelius in Calorimetru.</p>
  {:else if guideStep === 3}
    <p>{currentExperiment.reaction}: pregateste eprubetele indicate. Daca ai gresit substanta sau cantitatea, goleste eprubeta la Gunoi.</p>
    <div class="guide-list">
      {#each testTubeValidations as { item, validation }}
        <span class:done={validation?.isComplete} class:error={validation?.isValid === false}>
          {item.name}: {validation?.label} - {validation?.message}
        </span>
      {/each}
    </div>
  {:else if guideStep === 4}
    <p>Deschide widgetul Temperatura pentru grafic.</p>
  {:else if guideStep === 5}
    <p>Toarna eprubetele pentru {currentExperiment.reaction} in Calorimetru, apoi urmareste temperatura.</p>
    <div class="guide-list">
      {#each currentExperiment.pourTubes as tubeName}
        <span class:done={tubeName === "Eprubeta HCl" ? mainGlass?.state?.receivedHClTube : tubeName === "Eprubeta NaOH" ? mainGlass?.state?.receivedNaOHTube : tubeName === "Eprubeta H2SO4" ? mainGlass?.state?.receivedH2SO4Tube : mainGlass?.state?.receivedNH4OHTube}>{tubeName} turnata</span>
      {/each}
    </div>
  {:else if guideStep === 6}
    <p>Citeste din grafic temperatura la saltul initial si introdu valoarea masurata.</p>
    <label class="guide-field">
      Temperatura masurata (°C)
      <input
        type="number"
        step="0.1"
        bind:value={measuredTemperatureC}
        placeholder="ex: 31.4"
      />
    </label>
    <button type="button" class="guide-submit" onclick={submitMeasuredTemperature}>Submit</button>
  {:else if guideStep === 7}
    <p>Goleste Calorimetrul cu Berzelius la Gunoi. Dupa golire, temperatura se reseteaza si trecem la urmatorul experiment.</p>
  {:else}
    <p>Experimente finalizate. Valori masurate:</p>
    <div class="guide-list">
      {#each measuredResults as result}
        <span class="done">{result.reaction}: {result.measuredTempC.toFixed(1)}°C</span>
      {/each}
    </div>
    <p>Deschide Calculator si verifica rezultatele calculate cu temperaturile masurate.</p>
  {/if}
</aside>

<a 
  href="https://github.com/MonsieurLazar/termochimie-efect-termic" 
  target="_blank" 
  rel="noopener noreferrer" 
  class="github-floating-icon" 
  title="Vezi codul sursă pe GitHub"
>
  <img src="design/icons/github_icon-pixilart.png" alt="GitHub Project" />
  <img src="design/icons/github_icon-pixilart_hover.png" class="icon-hover" alt="GitHub Project Hover" />
</a>

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
    style:width={`${widgetSize.graph.width}px`}
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
        Temperatura
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("graph")}>X</button
      >
    </div>
    <div class="widget-body" style:height={`${widgetSize.graph.height}px`}>
      <MainGlassTemperatureChart {engine} showCloseButton={false} />
    </div>
    <button class="resize-handle resize-left" aria-label="Resize from bottom left" onmousedown={(event) => startResize("graph", "left", event)}></button>
    <button class="resize-handle resize-right" aria-label="Resize from bottom right" onmousedown={(event) => startResize("graph", "right", event)}></button>
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
    style:width={`${widgetSize.timer.width}px`}
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
        Ceas
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("timer")}>X</button
      >
    </div>
    <div class="widget-body" style:height={`${widgetSize.timer.height}px`}>
      <ExperimentTimer bind:timeScale={engine.timeScale} showCloseButton={false} />
    </div>
    <button class="resize-handle resize-left" aria-label="Resize from bottom left" onmousedown={(event) => startResize("timer", "left", event)}></button>
    <button class="resize-handle resize-right" aria-label="Resize from bottom right" onmousedown={(event) => startResize("timer", "right", event)}></button>
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
    style:width={`${widgetSize.debug.width}px`}
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
    <div class="widget-body" style:height={`${widgetSize.debug.height}px`}>
      <EngineDebugPanel {engine} showCloseButton={false} />
    </div>
    <button class="resize-handle resize-left" aria-label="Resize from bottom left" onmousedown={(event) => startResize("debug", "left", event)}></button>
    <button class="resize-handle resize-right" aria-label="Resize from bottom right" onmousedown={(event) => startResize("debug", "right", event)}></button>
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
    style:width={`${widgetSize.calculator.width}px`}
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
    <div class="external-widget-content widget-body" style:height={`${widgetSize.calculator.height}px`}>
      <CalculatorContent {measuredResults} />
    </div>
    <button class="resize-handle resize-left" aria-label="Resize from bottom left" onmousedown={(event) => startResize("calculator", "left", event)}></button>
    <button class="resize-handle resize-right" aria-label="Resize from bottom right" onmousedown={(event) => startResize("calculator", "right", event)}></button>
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
    style:width={`${widgetSize.theory.width}px`}
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
        Teorie
      </button>
      <button
        type="button"
        class="desktop-close"
        onclick={() => closeWidget("theory")}>X</button
      >
    </div>
    <div class="external-widget-content widget-body" style:height={`${widgetSize.theory.height}px`}>
      <TheoryContent />
    </div>
    <button class="resize-handle resize-left" aria-label="Resize from bottom left" onmousedown={(event) => startResize("theory", "left", event)}></button>
    <button class="resize-handle resize-right" aria-label="Resize from bottom right" onmousedown={(event) => startResize("theory", "right", event)}></button>
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
    overflow: visible;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .widget-body {
    min-height: 180px;
    overflow: auto;
    flex: 0 0 auto;
  }

  .experiment-guide {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 1500;
    width: min(320px, calc(100vw - 2rem));
    border: 4px solid #23364a;
    background: #f6e2a9;
    color: #1a2a3c;
    box-shadow: 6px 6px 0 #7b6850;
    padding: 0.8rem;
    font-weight: 700;
  }

  .guide-title {
    font-size: 1.05rem;
    margin-bottom: 0.25rem;
  }

  .guide-step-row {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }

  .guide-step {
    display: inline-block;
    border: 2px solid #23364a;
    background: #d7e7f4;
    padding: 0.15rem 0.45rem;
  }

  .experiment-guide p {
    margin: 0.25rem 0 0.6rem;
    line-height: 1.35;
  }

  .guide-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
  }

  .guide-list span {
    color: #6f1d1b;
  }

  .guide-list span.done {
    color: #1f7a3a;
  }

  .guide-list span.error {
    color: #b42318;
  }

  .guide-skip {
    border: 3px solid #23364a;
    background: #d7e7f4;
    color: #1a2a3c;
    box-shadow: 3px 3px 0 #7b6850;
    padding: 0.35rem 0.7rem;
    font-weight: 800;
    cursor: pointer;
  }

  .guide-submit {
    margin-top: 0.55rem;
    border: 3px solid #23364a;
    background: #d7e7f4;
    color: #1a2a3c;
    box-shadow: 3px 3px 0 #7b6850;
    padding: 0.35rem 0.7rem;
    font-weight: 800;
    cursor: pointer;
  }

  .guide-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.9rem;
  }

  .guide-field input {
    border: 3px solid #23364a;
    background: #fffdf4;
    color: #1a2a3c;
    padding: 0.35rem;
    font: inherit;
    font-weight: 700;
  }

  .guide-skip:active,
  .guide-submit:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #7b6850;
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

  .resize-handle {
    position: absolute;
    bottom: 4px;
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    padding: 0;
    z-index: 12;
  }

  .resize-handle::before {
    content: "";
    position: absolute;
    inset: 3px;
    opacity: 0.9;
  }

  .resize-left {
    left: 4px;
    cursor: nesw-resize;
  }

  .resize-left::before {
    background: repeating-linear-gradient(
      135deg,
      #23364a 0,
      #23364a 2px,
      transparent 2px,
      transparent 5px
    );
    clip-path: polygon(0 100%, 100% 100%, 0 0);
  }

  .resize-right {
    right: 4px;
    cursor: nwse-resize;
  }

  .resize-right::before {
    background: repeating-linear-gradient(
      45deg,
      #23364a 0,
      #23364a 2px,
      transparent 2px,
      transparent 5px
    );
    clip-path: polygon(100% 100%, 100% 0, 0 100%);
  }

  .github-floating-icon {
    position: fixed;
    bottom: 1rem;
    right: calc(min(320px, calc(100vw - 2rem)) + 2.2rem);
    z-index: 1500;
    
    width: 48px;
    height: 48px;
    display: block;
    transition: transform 0.2s ease;
  }

  .github-floating-icon img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.2s ease;
  }
  .icon-hover {
    opacity: 0;
  }

  .github-floating-icon:hover .icon-hover {
    opacity: 1;
  }

</style>
