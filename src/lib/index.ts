import { Item } from "./engine/item.svelte"
import { Engine } from "./engine/core.svelte"

const TRANSFER_RATE = 30 // units per second

const createInfiniteSource = (
  name: string,
  substance: string,
  x: number,
  y: number,
  color: string,
) =>
  new Item<{ substance: string }>(
    "infinite",
    name,
    { substance },
    { x, y },
    { width: 10, aspectRatio: 1 },
    () => `background-color: ${color};`,
    (_, target, __, deltaMs) => {
      if (target.kind === "glass" && deltaMs) {
        const amount = TRANSFER_RATE * (deltaMs / 1000)
        target.state.substances[substance] =
          (target.state.substances[substance] || 0) + amount
      }
    },
    (_, target) => (target.kind === "glass" ? "continuous" : false),
  )

const createGlass = (name: string, x: number, y: number) =>
  new Item<{ substances: Record<string, number> }>(
    "glass",
    name,
    { substances: {} },
    { x, y },
    { width: 4, aspectRatio: 0.5 },
    (state) => {
      const naoh = state.substances["NaOH"] || 0,
        h2o = state.substances["H2O"] || 0
      const total = naoh + h2o,
        nr = total > 0 ? naoh / total : 0,
        hr = total > 0 ? h2o / total : 0
      return `background: linear-gradient(to top, rgba(255,0,0,${nr}) ${nr * 100}%, rgba(0,255,0,${hr}) ${hr * 100}%);`
    },
    (self, target, _, deltaMs) => {
      if (target.kind === "glass" && deltaMs) {
        const subs = Object.keys(self.state.substances)
        const total = subs.reduce((s, k) => s + self.state.substances[k], 0)
        if (total <= 0) return
        const amount = Math.min(TRANSFER_RATE * (deltaMs / 1000), total)
        subs.forEach((k) => {
          const trans = (self.state.substances[k] / total) * amount
          target.state.substances[k] = (target.state.substances[k] || 0) + trans
          self.state.substances[k] = Math.max(
            0,
            self.state.substances[k] - trans,
          )
        })
      }
      if (target.kind === "spalatorie") self.state.substances = {}
    },
    (_, target) =>
      target.kind === "glass"
        ? "continuous"
        : target.kind === "spalatorie"
          ? "instant"
          : false,
  )

export const engine = new Engine([
  createInfiniteSource("Big NaOH", "NaOH", 10, 50, "red"),
  createInfiniteSource("Big H2O", "H2O", 10, 20, "lime"),
  createGlass("Glass 1", 17.65, 80),
  createGlass("Glass 2", 35.65, 80),
  new Item(
    "spalatorie",
    "Spalatorie",
    {},
    { x: 80, y: 50 },
    { width: 10, aspectRatio: 0.5 },
    () => `background-color: blue;`,
    (_, target) => {
      if (target.kind === "glass") target.state.substances = {}
    },
    (_, target) => (target.kind === "glass" ? "instant" : false),
  ),
])
