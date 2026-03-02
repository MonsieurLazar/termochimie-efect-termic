import { Engine, Item } from "./engine"

export const engine = new Engine([
  new Item(
    "item1",
    {
      value: 0,
    },
    {
      x: 10,
      y: 50,
    },
  ),
])
