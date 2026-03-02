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
  NaOH: { color: "255, 0, 0", density: 2.13, opacity: 0.8 },
  H2O: { color: "0, 200, 255", density: 1.0, opacity: 0.4 },
  NaOH_solution: { color: "200, 0, 255", density: 1.2, opacity: 0.6 },
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
    () => `background-color: ${color};`,
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
      const naoh = self.state.substances["NaOH"] || 0
      const h2o = self.state.substances["H2O"] || 0

      if (naoh > 0.01 && h2o > 0.01) {
        const rate = 0.5 * (deltaMs / 1000)
        const reacted = Math.min(naoh, h2o, rate)

        self.state.temperatureC += reacted * 10
        self.state.reactionIntensity = Math.min(
          1,
          self.state.reactionIntensity + 0.1,
        )

        self.state.substances["NaOH"] -= reacted
        self.state.substances["H2O"] -= reacted
        self.state.substances["NaOH_solution"] =
          (self.state.substances["NaOH_solution"] || 0) + reacted
      } else {
        self.state.reactionIntensity = Math.max(
          0,
          self.state.reactionIntensity - 0.02,
        )
      }

      const dt =
        (AMBIENT_TEMPERATURE - self.state.temperatureC) *
        COOLING_COEFFICIENT *
        (deltaMs / 1000)
      self.state.temperatureC += dt
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
  createInfiniteSource("Big NaOH", "NaOH", 10, 50, "red"),
  createInfiniteSource("Big H2O", "H2O", 10, 20, "blue"),
  createGlass("Glass 1", 27.65, 60, 25),
  createGlass("Glass 2", 35.65, 50, 50),
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
