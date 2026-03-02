import { Item } from "./engine/item.svelte"
import { Engine } from "./engine/core.svelte"
import GlassRenderer from "./engine/ui/GlassRenderer.svelte"

export const TRANSFER_RATE = 5 // units per second
export const AMBIENT_TEMPERATURE = 25
export const COOLING_COEFFICIENT = 0.03

export type SubstanceMeta = {
  color: string
  density: number
  opacity: number
}

export const SUBSTANCES: Record<string, SubstanceMeta> = {
  NaOH: { color: "255, 200, 200", density: 2.13, opacity: 0.9 }, // White-ish solid
  HCl: { color: "200, 255, 200", density: 1.18, opacity: 0.5 }, // Clear/greenish conc
  H2O: { color: "0, 200, 255", density: 1.0, opacity: 0.3 }, // Blue water
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

const createInfiniteSource = (
  name: string,
  substance: string,
  x: number,
  y: number,
  color: string,
) =>
  new Item<any>(
    "infinite",
    name,
    { substances: { [substance]: 1 }, temperatureC: AMBIENT_TEMPERATURE },
    { x, y },
    { width: 10, aspectRatio: 1 },
    undefined,
    () =>
      `background-color: ${color}; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);`,
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

        targetState.substances[substance] =
          (targetState.substances[substance] || 0) + amount
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
  )

const createGlass = (name: string, x: number, y: number, maxCapacity = 100) =>
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
    { width: 7, aspectRatio: 0.5 },
    GlassRenderer as any,
    undefined,
    (self, engine, deltaMs) => {
      const state = self.state
      const subs = state.substances
      const dt = deltaMs / 1000
      let reactionOccurred = false

      // 1. Dissolution: NaOH + H2O -> NaOH_aq
      if (subs["NaOH"] > 0 && subs["H2O"] > 0.1) {
        const rate = 2.0 * dt
        const reacted = Math.min(subs["NaOH"], subs["H2O"], rate)
        subs["NaOH"] -= reacted
        subs["NaOH_aq"] = (subs["NaOH_aq"] || 0) + reacted
        state.temperatureC += reacted * 15
        reactionOccurred = true
      }

      // 2. Dissolution: HCl + H2O -> HCl_aq
      if (subs["HCl"] > 0 && subs["H2O"] > 0.1) {
        const rate = 2.0 * dt
        const reacted = Math.min(subs["HCl"], subs["H2O"], rate)
        subs["HCl"] -= reacted
        subs["HCl_aq"] = (subs["HCl_aq"] || 0) + reacted
        state.temperatureC += reacted * 12
        reactionOccurred = true
      }

      // 3. Neutralization: NaOH_aq + HCl_aq -> NaCl_aq + H2O
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
  )

export const engine = new Engine([
  createInfiniteSource("NaOH (s)", "NaOH", 5, 10, "#fee2e2"),
  createInfiniteSource("HCl (conc)", "HCl", 15, 30, "#dcfce7"),
  createInfiniteSource("Distilled H2O", "H2O", 5, 50, "#3b82f6"),
  createInfiniteSource("Phenolphthalein", "Indicator", 15, 70, "#fdf4ff"),

  createGlass("Main Glass", 30, 50, 150),
  createGlass("Secondary Glass", 50, 50, 100),

  new Item<GlassState>(
    "spalatorie",
    "Spalatorie",
    {
      substances: {},
      temperatureC: AMBIENT_TEMPERATURE,
      reactionIntensity: 0,
      maxCapacity: 0,
    },
    { x: 80, y: 50 },
    { width: 10, aspectRatio: 0.5 },
    undefined,
    () =>
      `background-color: #3b82f6; border: 2px solid #2563eb; border-radius: 8px;`,
    undefined,
    (_, target) => {
      if (target.kind === "glass") {
        target.state.substances = {}
        target.state.temperatureC = AMBIENT_TEMPERATURE
        target.state.reactionIntensity = 0
      }
    },
    (_, target) => (target.kind === "glass" ? "instant" : false),
  ),
])
