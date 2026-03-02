import { Item } from "./engine/item.svelte"
import { Engine } from "./engine/core.svelte"

export const TRANSFER_RATE = 1 // units per second
export const AMBIENT_TEMPERATURE = 25
export const COOLING_COEFFICIENT = 0.03

type GlassState = {
  substances: Record<string, number>
  temperatureC: number
}

const createInfiniteSource = (
  name: string,
  substance: string,
  x: number,
  y: number,
  color: string,
) =>
  new Item<GlassState>(
    "infinite",
    name,
    {
      substance: { [substance]: 1 },
      substances: {},
      temperatureC: AMBIENT_TEMPERATURE,
    } as any,
    { x, y },
    { width: 10, aspectRatio: 1 },
    () => `background-color: ${color};`,
    undefined,
    (_, target, __, deltaMs) => {
      if (target.kind === "glass" && deltaMs) {
        const amount = TRANSFER_RATE * (deltaMs / 1000)

        const targetTotal = Object.values(
          target.state.substances as Record<string, number>,
        ).reduce((a: number, b: number) => a + b, 0)
        const newTotal = targetTotal + amount
        const targetState = target.state as GlassState
        targetState.temperatureC =
          (targetState.temperatureC * targetTotal +
            AMBIENT_TEMPERATURE * amount) /
          newTotal

        target.state.substances[substance] =
          (target.state.substances[substance] || 0) + amount
      }
    },
    (_, target) => (target.kind === "glass" ? "continuous" : false),
  )

const createGlass = (name: string, x: number, y: number) =>
  new Item<GlassState>(
    "glass",
    name,
    { substances: {}, temperatureC: AMBIENT_TEMPERATURE },
    { x, y },
    { width: 7, aspectRatio: 0.5 },
    (state) => {
      const naoh = state.substances["NaOH"] || 0,
        h2o = state.substances["H2O"] || 0
      const solution = state.substances["NaOH_solution"] || 0
      const total = naoh + h2o + solution,
        nr = total > 0 ? naoh / total : 0,
        hr = total > 0 ? h2o / total : 0,
        sr = total > 0 ? solution / total : 0

      const t = Math.min(100, Math.max(0, state.temperatureC - 25)) / 75
      const border = `border: ${2 + t * 3}px solid rgb(${255 * t}, 0, 0);`

      return `${border} background: linear-gradient(to top, rgba(255,0,0,${nr}) ${nr * 100}%, rgba(0,255,0,${hr}) ${hr * 100}%, rgba(128,128,128,${sr}) ${sr * 100}%);`
    },
    (self, engine, deltaMs) => {
      const naoh = self.state.substances["NaOH"] || 0
      const h2o = self.state.substances["H2O"] || 0

      if (naoh > 0 && h2o > 0) {
        const rate = 0.05 * (deltaMs / 1000)
        const reacted = Math.min(naoh, h2o, rate)

        self.state.temperatureC += reacted * 10

        self.state.substances["NaOH"] -= reacted
        self.state.substances["H2O"] -= reacted
        self.state.substances["NaOH_solution"] =
          (self.state.substances["NaOH_solution"] || 0) + reacted
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
        const total = subs.reduce((s, k) => s + self.state.substances[k], 0)
        if (total <= 0) return
        const amount = Math.min(TRANSFER_RATE * (deltaMs / 1000), total)

        const targetState = target.state as GlassState
        const targetTotal = Object.values(targetState.substances).reduce(
          (a: number, b: number) => a + b,
          0,
        )
        const newTargetTotal = targetTotal + amount

        if (newTargetTotal > 0) {
          targetState.temperatureC =
            (targetState.temperatureC * targetTotal +
              self.state.temperatureC * amount) /
            newTargetTotal
        }

        subs.forEach((k) => {
          const trans = (self.state.substances[k] / total) * amount
          target.state.substances[k] = (target.state.substances[k] || 0) + trans
          self.state.substances[k] = Math.max(
            0,
            self.state.substances[k] - trans,
          )
        })
      }
      if (target.kind === "spalatorie") {
        self.state.substances = {}
        self.state.temperatureC = AMBIENT_TEMPERATURE
      }
    },
    (self, target) => {
      if (target.kind === "glass") {
        const total = Object.values(self.state.substances).reduce(
          (s, k) => s + k,
          0,
        )
        return total > 0 ? "continuous" : false
      }
      if (target.kind === "spalatorie") return "instant"
      return false
    },
  )

export const engine = new Engine([
  createInfiniteSource("Big NaOH", "NaOH", 10, 50, "red"),
  createInfiniteSource("Big H2O", "H2O", 10, 20, "lime"),
  createGlass("Glass 1", 27.65, 60),
  createGlass("Glass 2", 35.65, 50),
  new Item<GlassState>(
    "spalatorie",
    "Spalatorie",
    { substances: {}, temperatureC: AMBIENT_TEMPERATURE },
    { x: 80, y: 50 },
    { width: 10, aspectRatio: 0.5 },
    () => `background-color: blue;`,
    undefined,
    (_, target) => {
      if (target.kind === "glass") {
        target.state.substances = {}
      }
    },
    (_, target) => (target.kind === "glass" ? "instant" : false),
  ),
])
