import { Item } from "./engine/item.svelte"
import { Engine } from "./engine/core.svelte"
import GlassRenderer from "./engine/ui/GlassRenderer.svelte"
import EngineButtonRenderer from "./engine/ui/EngineButtonRenderer.svelte"

export const TRANSFER_RATE = 5 // units per second
export const AMBIENT_TEMPERATURE = 25
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
  NaCl_aq: { color: "200, 200, 200", density: 1.1, opacity: 0.4 },
  Indicator: { color: "255, 255, 255", density: 0.9, opacity: 0.1 },
}

export type GlassState = {
  substances: Record<string, number>
  temperatureC: number
  reactionIntensity: number
  maxCapacity: number
}

const SPRITE_SIZE_PX: Record<string, { width: number; height: number }> = {
  "/design/300x300/subst_inf_300.png": { width: 151, height: 220 },
  "/design/300x300/apa_distilata_300.png": { width: 115, height: 280 },
  "/design/300x300/calorimetru_300.png": { width: 121, height: 151 },
  "/design/300x300/erlenmeyer_300.png": { width: 160, height: 193 },
  "/design/300x300/eprubeta_300.png": { width: 106, height: 286 },
  "/design/300x300/residuu_300.png": { width: 121, height: 199 },
}

const BASE_SPRITE_PATH = "/design/300x300/calorimetru_300.png"
const BASE_ENGINE_WIDTH_PERCENT = 8
const PIXEL_TO_PERCENT =
  BASE_ENGINE_WIDTH_PERCENT / SPRITE_SIZE_PX[BASE_SPRITE_PATH].width

const spriteDimension = (imageUrl: string, fallbackWidthPercent = 10) => {
  const size = SPRITE_SIZE_PX[imageUrl]
  if (!size) {
    return { width: fallbackWidthPercent, aspectRatio: 1 }
  }

  return {
    width: Number((size.width * PIXEL_TO_PERCENT).toFixed(2)),
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
      }
    },
    (_, target) => {
      if (target.kind !== "glass") return false
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
) =>
  new Item<GlassState>(
    "glass",
    name,
    {
      substances: {},
      temperatureC: AMBIENT_TEMPERATURE,
      reactionIntensity: 0,
      maxCapacity,
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
        state.temperatureC += reacted * 40
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
      if (target.kind === "glass" && deltaMs) {
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
      }
      if (target.kind === "spalatorie") {
        self.state.substances = {}
        self.state.temperatureC = AMBIENT_TEMPERATURE
        self.state.reactionIntensity = 0
      }
    },
    (self, target) => {
      if (target.kind === "glass") {
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
      { width: 11, aspectRatio: 1.8 },
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
  createInfiniteSource("NaOH sol. 10%", { NaOH_aq: 0.3, H2O: 0.7 }, 2, 4, "#ffbdbd", "/design/300x300/subst_inf_300.png"),
  createInfiniteSource("HCl sol. 10%", { HCl_aq: 0.3, H2O: 0.7 }, 2, 32, "#b6ffd0","/design/300x300/subst_inf_300.png"),
  createInfiniteSource("Distilled H2O", { H2O: 1 }, 2, 60, "#7accff","/design/300x300/apa_distilata_300.png"),
  createGlass("Main Glass", 30, 52, 150, "/design/300x300/calorimetru_300.png", "", 15, false),
  createGlass("Secondary Glass", 50, 55, 100, "/design/300x300/erlenmeyer_300.png", "", 8),
  createGlass("Ep1", 34, 2, 100, "/design/300x300/eprubeta_300.png", "", 6),
  createGlass("Ep2", 47, 2, 100, "/design/300x300/eprubeta_300.png", "", 6),
  createGlass("Ep3", 60, 2, 100, "/design/300x300/eprubeta_300.png", "", 6),


  new Item<GlassState>(
    "spalatorie",
    "Spalatorie",
    {
      substances: {},
      temperatureC: AMBIENT_TEMPERATURE,
      reactionIntensity: 0,
      maxCapacity: 0,
    },
    { x: 67, y: 22 },
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
      }
    },
    (_, target) => (target.kind === "glass" ? "instant" : false),
    undefined,
    "/design/300x300/residuu_300.png",
  ),

  createUiButton("Open Theory", 82, 2, "theory"),
  createUiButton("Open Graph", 82, 16, "graph"),
  createUiButton("Open Timer", 82, 30, "timer"),
  createUiButton("Open Calculator", 82, 44, "calculator"),
  createUiButton("Open Debug", 82, 58, "debug"),
])
