import { Engine, Item } from "./engine.svelte"

export const engine = new Engine([
  new Item(
    "item1",
    {
      value: 50,
    },
    {
      x: 10,
      y: 50,
    },
    {
      width: 100,
      height: 100,
    },
    (state) => `background-color: rgba(255, 0, 0, ${state.value / 100});`,
  ),
])
