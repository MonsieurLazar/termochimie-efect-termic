import { Item } from "./engine/item.svelte"
import { Engine } from "./engine/core.svelte"
import GlassRenderer from "./engine/ui/GlassRenderer.svelte"
import EngineButtonRenderer from "./engine/ui/EngineButtonRenderer.svelte"

export const TRANSFER_RATE = 5 // units per second
export const AMBIENT_TEMPERATURE = 21
export const COOLING_COEFFICIENT = 0.03

export type SubstanceMeta = {
  color: string
  density: number
  opacity: number
}

export const SUBSTANCES: Record<string, SubstanceMeta> = {//substantele
  NaOH: { color: "255, 100, 100", density: 2.13, opacity: 0.9 }, // pellets
  HCl: { color: "200, 255, 200", density: 1.18, opacity: 0.5 },
  H2O: { color: "0, 100, 155", density: 1.0, opacity: 0.6 }, 
  NaOH_aq: { color: "255, 100, 0", density: 1.05, opacity: 0.6 },
  HCl_aq: { color: "100, 255, 0", density: 1.05, opacity: 0.6 },
  H2SO4_aq: { color: "25, 116, 132", density: 1.08, opacity: 0.6 },
  NH4OH_aq: { color: "9, 96, 195", density: 1.02, opacity: 0.6 },
  NaCl_aq: { color: "200, 200, 200", density: 1.1, opacity: 0.4 },
  Na2SO4_aq: { color: "180, 180, 210", density: 1.12, opacity: 0.4 },
  NH4Cl_aq: { color: "210, 210, 230", density: 1.05, opacity: 0.4 },
  Indicator: { color: "255, 255, 255", density: 0.9, opacity: 0.1 },
}

export type GlassState = {
  substances: Record<string, number>
  temperatureC: number
  reactionIntensity: number
  maxCapacity: number
  hasGlass?: boolean
  hasThermometer?: boolean
  isHidden?: boolean
  isDirty?: boolean
  rinseUnits?: number
  validationErrorShown?: boolean
  receivedHClTube?: boolean
  receivedNaOHTube?: boolean
  receivedNH4OHTube?: boolean
  receivedH2SO4Tube?: boolean
}

export type TestTubeRequirement = {
  requiredSubstance?: string
  requiredVolume?: number
  label: string
}

let testTubeRequirements: Record<string, TestTubeRequirement> = {
  "Cilindru gradat HCl": { requiredSubstance: "HCl_aq", requiredVolume: 25, label: "25 ml HCl" },
  "Cilindru gradat NaOH": { requiredSubstance: "NaOH_aq", requiredVolume: 50, label: "50 ml NaOH" },
  "Cilindru gradat NH4OH": { label: "nefolosit in acest pas" },
}

export const setTestTubeRequirements = (requirements: Record<string, TestTubeRequirement>) => {
  testTubeRequirements = requirements
  isCalorimeterPourUnlocked = false
}

export const getTestTubeRequirements = () => testTubeRequirements

export const TEST_TUBE_REQUIREMENTS: Record<
  string,
  TestTubeRequirement
> = testTubeRequirements

export const getTestTubeValidation = (item: Item<any>) => {
  const requirement = testTubeRequirements[item.name]
  if (!requirement) return null
  if (!requirement.requiredSubstance || !requirement.requiredVolume) {
    return {
      ...requirement,
      isComplete: true,
      isValid: true,
      message: "Curata-l si lasa-l gol pentru acest experiment.",
    }
  }

  const substances = (item.state as GlassState).substances
  const totalAmount = Object.values(substances).reduce((sum, amount) => sum + amount, 0)
  const requiredAmount = substances[requirement.requiredSubstance] || 0
  const foreignSubstances = Object.entries(substances)
    .filter(([name, amount]) => amount > 0.01 && name !== requirement.requiredSubstance && name !== "H2O")
    .map(([name]) => name)

  if (foreignSubstances.length > 0) {
    return {
      ...requirement,
      isComplete: false,
      isValid: false,
      message: `Substanta gresita (${foreignSubstances.join(", ")}). Goleste la Reziduu si reia.` ,
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

  const tolerance = 2
  const isValid = Math.abs(totalAmount - requirement.requiredVolume) <= tolerance

  return {
    ...requirement,
    isComplete: isValid,
    isValid,
    message: isValid
      ? `Corect: ${totalAmount.toFixed(1)} ml.`
      : `Cantitate gresita: ai ${totalAmount.toFixed(1)} ml, trebuie ${requirement.requiredVolume} ml. Goleste la Reziduu si reia.`,
  }
}

const areTestTubeReactionsComplete = () =>
  engine.items
    .filter((item) => testTubeRequirements[item.name]?.requiredSubstance)
    .every((item) => getTestTubeValidation(item)?.isComplete)

let isCalorimeterPourUnlocked = false

const isGraphOpen = () => engine.widgetVisibility.graph

const isCalorimeterReadyForPour = () => {
  if (areTestTubeReactionsComplete() && isGraphOpen()) {
    isCalorimeterPourUnlocked = true
  }
  return isCalorimeterPourUnlocked
}

const hasCalorimeterAccessories = (state: GlassState) =>
  state.hasGlass === true && state.hasThermometer === true

const canReceiveLiquid = (target: Item<any>) => {
  if (target.kind !== "glass") return false
  if ((target.state as GlassState).isDirty) return false
  if (target.name !== "Calorimetru") return true
  if (!isCalorimeterReadyForPour()) return false
  return hasCalorimeterAccessories(target.state as GlassState)
}

const SPRITE_SIZE_PX: Record<string, { width: number; height: number }> = {
  "/design/300x300/subst_inf_300.png": { width: 151, height: 220 },
  "/design/300x300/apa_distilata_300.png": { width: 115, height: 280 },
  "/design/300x300/calorimetru_300.png": { width: 121, height: 151 },
  "/design/300x300/termometru_300.png": { width: 43, height: 253 },
  "/design/300x300/erlenmeyer_300.png": { width: 160, height: 193 },
  "/design/300x300/eprubeta_300.png": { width: 106, height: 286 },
  "/design/300x300/residuu_300.png": { width: 121, height: 199 },
}

const BASE_SPRITE_PATH = "/design/300x300/calorimetru_300.png"
type CalorimeterAssetState = "empty" | "thermometer" | "berzelius" | "complete"

const CALORIMETER_SPRITES: Record<CalorimeterAssetState, string> = {
  empty: "/design/300x300/calorimetru_300.png",
  thermometer: "/design/300x300/calorimetru_termometru_300_300.png",
  berzelius: "/design/300x300/calorimetru_berzelius_300_300.png",
  complete: "/design/300x300/calorimetru_berzelius_termometru_300_300.png",
}

const getCalorimeterAssetState = (state: GlassState): CalorimeterAssetState => {
  if (state.hasGlass && state.hasThermometer) return "complete"
  if (state.hasGlass) return "berzelius"
  if (state.hasThermometer) return "thermometer"
  return "empty"
}

export const updateCalorimeterSprite = (item: Item<any>) => {
  if (item.name !== "Calorimetru") return
  item.imageUrl = CALORIMETER_SPRITES[getCalorimeterAssetState(item.state as GlassState)]
}

const BASE_ENGINE_WIDTH_PERCENT = 8
const ITEM_SCALE = 0.8
const PIXEL_TO_PERCENT =
  BASE_ENGINE_WIDTH_PERCENT / SPRITE_SIZE_PX[BASE_SPRITE_PATH].width

const spriteDimension = (imageUrl: string, fallbackWidthPercent = 10) => {
  const size = SPRITE_SIZE_PX[imageUrl]
  if (!size) {
    return { width: fallbackWidthPercent, aspectRatio: 1 }
  }

  return {
    width: Number((size.width * PIXEL_TO_PERCENT * ITEM_SCALE).toFixed(2)),
    aspectRatio: size.width / size.height,
  }
}

const createInfiniteSource = (name: string, recipe: Record<string, number>, x: number,  y: number,  color: string, imageUrl: string) =>
  new Item<any>(
    "infinite",
    name,
    { substances: recipe, temperatureC: AMBIENT_TEMPERATURE },
    { x, y },
    spriteDimension(imageUrl, 13),
    undefined,
    () => "",
     // `background-color: ${color}; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);`,
    undefined,
    (_, target, __, deltaMs) => {
      if (target.kind === "glass" && deltaMs) {
        const targetState = target.state as GlassState
        if (targetState.isDirty && (recipe.H2O || 0) < 1) return
        if (!targetState.isDirty && !canReceiveLiquid(target)) return

        const targetTotal = Object.values(targetState.substances).reduce(
          (a: number, b: number) => a + b,
          0,
        )
        const remaining = Math.max(0, targetState.maxCapacity - targetTotal)
        if (remaining <= 0) return

        const amount = Math.min(TRANSFER_RATE * (deltaMs / 1000), remaining)
        
        const newTotal = targetTotal + amount
        targetState.temperatureC =
          (targetState.temperatureC * targetTotal +
            AMBIENT_TEMPERATURE * amount) /
          newTotal

        Object.entries(recipe).forEach(([sub, fraction]) => {
          targetState.substances[sub] = (targetState.substances[sub] || 0) + amount * fraction
        })
        if (targetState.isDirty) {
          targetState.rinseUnits = Math.min(15, (targetState.rinseUnits || 0) + amount)
        }
      }
    },
    (_, target) => {
      if (target.name === "Calorimetru") return false
      if (target.kind === "glass" && (target.state as GlassState).isDirty) {
        if ((recipe.H2O || 0) < 1) return false
        const targetState = target.state as GlassState
        const targetTotal = Object.values(targetState.substances).reduce(
          (a: number, b: number) => a + b,
          0,
        )
        return targetTotal < targetState.maxCapacity && (targetState.rinseUnits || 0) < 15
          ? "continuous"
          : false
      }
      if (!canReceiveLiquid(target)) return false
      const targetState = target.state as GlassState
      const targetTotal = Object.values(targetState.substances).reduce(
        (a: number, b: number) => a + b,
        0,
      )
      return targetTotal < targetState.maxCapacity ? "continuous" : false
    },
    undefined,
    imageUrl,
    ""
  )

const createGlass = (
  name: string,
  x: number,
  y: number,
  maxCapacity = 100,
  imageUrl: string,
  color: string = "",
  width: number = 15,
  useGlassRenderer = true,
  hasGlass = true,
  isDirty = false,
) =>
  new Item<GlassState>(
    "glass",
    name,
    {
      substances: {},
      temperatureC: AMBIENT_TEMPERATURE,
      reactionIntensity: 0,
      maxCapacity,
      hasGlass,
      isDirty,
    },
    { x, y },
    spriteDimension(imageUrl, width),
    useGlassRenderer ? (GlassRenderer as any) : undefined,
    undefined,
    (self, engine, deltaMs) => {
      const state = self.state
      const subs = state.substances
      const dt = deltaMs / 1000
      let reactionOccurred = false

      // Neutralization: NaOH_aq + HCl_aq -> NaCl_aq + H2O
      if (subs["NaOH_aq"] > 0.01 && subs["HCl_aq"] > 0.01) {
        const rate = 10.0 * dt
        const reacted = Math.min(subs["NaOH_aq"], subs["HCl_aq"], rate)
        subs["NaOH_aq"] -= reacted
        subs["HCl_aq"] -= reacted
        subs["NaCl_aq"] = (subs["NaCl_aq"] || 0) + reacted
        subs["H2O"] = (subs["H2O"] || 0) + reacted
        state.temperatureC += reacted * 0.52
        reactionOccurred = true
      }

      // Neutralization: H2SO4_aq + 2NaOH_aq -> Na2SO4_aq + 2H2O
      if (subs["H2SO4_aq"] > 0.01 && subs["NaOH_aq"] > 0.01) {
        const acidNeededForBase = subs["NaOH_aq"] / 2
        const rate = 10.0 * dt
        const reactedAcid = Math.min(subs["H2SO4_aq"], acidNeededForBase, rate)
        const reactedBase = reactedAcid * 2
        subs["H2SO4_aq"] -= reactedAcid
        subs["NaOH_aq"] -= reactedBase
        subs["Na2SO4_aq"] = (subs["Na2SO4_aq"] || 0) + reactedAcid
        subs["H2O"] = (subs["H2O"] || 0) + reactedBase
        state.temperatureC += reactedAcid * 0.533
        reactionOccurred = true
      }

      // Neutralization: HCl_aq + NH4OH_aq -> NH4Cl_aq + H2O
      if (subs["HCl_aq"] > 0.01 && subs["NH4OH_aq"] > 0.01) {
        const rate = 10.0 * dt
        const reacted = Math.min(subs["HCl_aq"], subs["NH4OH_aq"], rate)
        subs["HCl_aq"] -= reacted
        subs["NH4OH_aq"] -= reacted
        subs["NH4Cl_aq"] = (subs["NH4Cl_aq"] || 0) + reacted
        subs["H2O"] = (subs["H2O"] || 0) + reacted
        state.temperatureC += reacted * 0.28
        reactionOccurred = true
      }

      if (reactionOccurred) {
        state.reactionIntensity = Math.min(1, state.reactionIntensity + 0.2)
      } else {
        state.reactionIntensity = Math.max(0, state.reactionIntensity - 0.05)
      }

      const cooldown =
        (AMBIENT_TEMPERATURE - state.temperatureC) * COOLING_COEFFICIENT * dt
      state.temperatureC += cooldown
    },
    (self, target, _, deltaMs) => {
      if (target.name === "Calorimetru" && isCalorimeterReadyForPour() && hasCalorimeterAccessories(target.state as GlassState)) {
        const subs = Object.keys(self.state.substances)
        const sourceTotal = subs.reduce(
          (s, k) => s + self.state.substances[k],
          0,
        )
        if (sourceTotal <= 0) return

        const targetState = target.state as GlassState
        const targetTotal = Object.values(targetState.substances).reduce(
          (a: number, b: number) => a + b,
          0,
        )
        const remaining = Math.max(0, targetState.maxCapacity - targetTotal)
        const amount = Math.min(sourceTotal, remaining)
        if (amount <= 0) return

        const newTargetTotal = targetTotal + amount
        targetState.temperatureC =
          (targetState.temperatureC * targetTotal +
            self.state.temperatureC * amount) /
          newTargetTotal

        subs.forEach((k) => {
          const trans = (self.state.substances[k] / sourceTotal) * amount
          targetState.substances[k] = (targetState.substances[k] || 0) + trans
          self.state.substances[k] = Math.max(
            0,
            self.state.substances[k] - trans,
          )
        })

        if (self.name === "Cilindru gradat HCl") targetState.receivedHClTube = true
        if (self.name === "Cilindru gradat NaOH") targetState.receivedNaOHTube = true
        if (self.name === "Cilindru gradat NH4OH") targetState.receivedNH4OHTube = true
        if (self.name === "Cilindru gradat H2SO4") targetState.receivedH2SO4Tube = true
        return
      }

      if (canReceiveLiquid(target) && deltaMs) {
        const subs = Object.keys(self.state.substances)
        const sourceTotal = subs.reduce(
          (s, k) => s + self.state.substances[k],
          0,
        )
        if (sourceTotal <= 0) return

        const targetState = target.state as GlassState
        const targetTotal = Object.values(targetState.substances).reduce(
          (a: number, b: number) => a + b,
          0,
        )
        const remaining = Math.max(0, targetState.maxCapacity - targetTotal)
        if (remaining <= 0) return

        const amount = Math.min(
          TRANSFER_RATE * (deltaMs / 1000),
          sourceTotal,
          remaining,
        )
        const newTargetTotal = targetTotal + amount

        if (newTargetTotal > 0) {
          targetState.temperatureC =
            (targetState.temperatureC * targetTotal +
              self.state.temperatureC * amount) /
            newTargetTotal
        }

        subs.forEach((k) => {
          const trans = (self.state.substances[k] / sourceTotal) * amount
          targetState.substances[k] = (targetState.substances[k] || 0) + trans
          self.state.substances[k] = Math.max(
            0,
            self.state.substances[k] - trans,
          )
        })
        if (target.name === "Calorimetru") {
          if (self.name === "Cilindru gradat HCl") targetState.receivedHClTube = true
          if (self.name === "Cilindru gradat NaOH") targetState.receivedNaOHTube = true
          if (self.name === "Cilindru gradat NH4OH") targetState.receivedNH4OHTube = true
          if (self.name === "Cilindru gradat H2SO4") targetState.receivedH2SO4Tube = true
        }
      }
      if (self.name === "Berzelius" && target.name === "Calorimetru") {
        const targetState = target.state as GlassState
        const subs = Object.keys(self.state.substances)
        const sourceTotal = subs.reduce(
          (s, k) => s + self.state.substances[k],
          0,
        )
        const targetTotal = Object.values(targetState.substances).reduce(
          (a: number, b: number) => a + b,
          0,
        )
        const remaining = Math.max(0, targetState.maxCapacity - targetTotal)
        const amount = Math.min(sourceTotal, remaining)

        if (amount > 0) {
          const newTargetTotal = targetTotal + amount
          targetState.temperatureC =
            (targetState.temperatureC * targetTotal +
              self.state.temperatureC * amount) /
            newTargetTotal

          subs.forEach((k) => {
            const trans = (self.state.substances[k] / sourceTotal) * amount
            targetState.substances[k] = (targetState.substances[k] || 0) + trans
            self.state.substances[k] = Math.max(
              0,
              self.state.substances[k] - trans,
            )
          })
        }

        targetState.hasGlass = true
        updateCalorimeterSprite(target)
        self.state.isHidden = true
      }
      if (target.kind === "spalatorie") {
        self.state.substances = {}
        self.state.temperatureC = AMBIENT_TEMPERATURE
        self.state.reactionIntensity = 0
        if (!self.state.isDirty || (self.state.rinseUnits || 0) >= 10) {
          self.state.isDirty = false
          self.state.rinseUnits = 0
        }
      }
    },
    (self, target) => {
      if (self.state.isDirty && target.kind !== "spalatorie") return false
      if (self.name === "Berzelius" && target.name === "Calorimetru") {
        return (target.state as GlassState).hasGlass ? false : "instant"
      }
      if (target.name === "Calorimetru" && isCalorimeterReadyForPour() && hasCalorimeterAccessories(target.state as GlassState)) {
        return Object.values(self.state.substances).some((amount) => amount > 0)
          ? "instant"
          : false
      }
      if (canReceiveLiquid(target)) {
        const sourceTotal = Object.values(self.state.substances).reduce(
          (s, k) => s + (k as number),
          0,
        )
        const targetState = target.state as GlassState
        const targetTotal = Object.values(targetState.substances).reduce(
          (s, k) => s + k,
          0,
        )
        return sourceTotal > 0 && targetTotal < targetState.maxCapacity
          ? "continuous"
          : false
      }
      if (target.kind === "spalatorie") return "instant"
      return false
    },
    undefined,
    imageUrl,
    color
  )

  const createThermometer = (x: number, y: number) =>
    new Item<{
      isHidden?: boolean
    }>(
      "tool",
      "Termometru",
      { isHidden: false },
      { x, y },
      spriteDimension("/design/300x300/termometru_300.png", 4),
      undefined,
      () => "",
      undefined,
      (self, target) => {
        if (target.name !== "Calorimetru") return
        ;(target.state as GlassState).hasThermometer = true
        updateCalorimeterSprite(target)
        self.state.isHidden = true
      },
      (_, target) => {
        if (target.name !== "Calorimetru") return false
        return (target.state as GlassState).hasThermometer ? false : "instant"
      },
      undefined,
      "/design/300x300/termometru_300.png",
      ""
    )

  const createUiButton = (
    name: string,
    x: number,
    y: number,
    widget: "theory" | "graph" | "timer" | "calculator" | "debug",
  ) => {
    const button = new Item<{
      widget: "graph" | "timer" | "debug" | "calculator" | "theory"
    }>(
      "ui-button",
      name,
      { widget },
      { x, y },
      { width: 17.6, aspectRatio: 1.8 },
      EngineButtonRenderer as any,
      () => "",
      undefined,
      undefined,
      () => false,
      (_, engine) => {
        engine.openWidget(widget)
      },
    );

    button.imageUrl = `/design/icons/${widget}.png`;

    return button;
};

export const engine = new Engine([
  createInfiniteSource("NaOH sol. 0.5M", { NaOH_aq: 0.3, H2O: 0.7 }, 2, 0, "#ffbdbd", "/design/300x300/baza_298_436.png"),
  createInfiniteSource("HCl sol. 1M", { HCl_aq: 0.3, H2O: 0.7 }, 2, 30, "#b6ffd0","/design/300x300/acid_298_436.png"),
  createInfiniteSource("H2SO4 sol. 1M", { H2SO4_aq: 0.3, H2O: 0.7 }, 15, 0, "#197484","/design/300x300/acid_298_436.png"),
  createInfiniteSource("NH4OH sol. 0.5M", { NH4OH_aq: 0.3, H2O: 0.7 }, 15, 30, "#0960c3","/design/300x300/baza_298_436.png"),
  createInfiniteSource("Distilled H2O", { H2O: 1 }, 2, 62, "#7accff","/design/300x300/apa_distilata_300.png"),

  createGlass("Calorimetru", 30, 52, 150, "/design/300x300/calorimetru_300.png", "", 15, false, false),
  createThermometer(42, 55),
  createGlass("Berzelius", 50, 55, 100, "/design/300x300/erlenmeyer_300.png", "", 8, true, true, true),
  createGlass("Cilindru gradat NaOH", 32, 2, 100, "/design/300x300/eprubeta_300.png", "", 6, true, true, true),
  createGlass("Cilindru gradat HCl", 40, 2, 100, "/design/300x300/eprubeta_300.png", "", 6, true, true, true),
  createGlass("Cilindru gradat H2SO4", 48, 2, 100, "/design/300x300/eprubeta_300.png", "", 6, true, true, true),
  createGlass("Cilindru gradat NH4OH", 56, 2, 100, "/design/300x300/eprubeta_300.png", "", 6, true, true, true),


  new Item<GlassState>(
    "spalatorie",
    "Reziduu",
    {
      substances: {},
      temperatureC: AMBIENT_TEMPERATURE,
      reactionIntensity: 0,
      maxCapacity: 0,
      rinseUnits: 0,
    },
    { x: 67, y: 40 },
    spriteDimension("/design/300x300/residuu_300.png", 20),
    undefined,
    () => "",
      //`background-color: #3b82f6; border: 2px solid #2563eb; border-radius: 8px;`,
    undefined,
    (_, target) => {
      if (target.kind === "glass") {
        target.state.substances = {}
        target.state.temperatureC = AMBIENT_TEMPERATURE
        target.state.reactionIntensity = 0
        if (!target.state.isDirty || (target.state.rinseUnits || 0) >= 10) {
          target.state.isDirty = false
          target.state.rinseUnits = 0
        }
      }
    },
    (_, target) => (target.kind === "glass" ? "instant" : false),
    undefined,
    "/design/300x300/residuu_300.png",
  ),

  createUiButton("Teorie", 70, 2, "theory"),
  createUiButton("Temperatura", 80, 2, "graph"),
  createUiButton("Ceas", 70, 18, "timer"),
  createUiButton("Calculator", 80, 18, "calculator"),
])
