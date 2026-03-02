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
      width: 10,
      aspectRatio: 1 / 1,
    },
    (state) => `background-color: rgba(255, 0, 0, ${state.value / 100});`,
    (thisItem, targetItem, alert) => {
      if (thisItem.state.value < 10) {
        alert("Item 1 has too little value!")
        return
      }
      if (targetItem.name === "item2") {
        targetItem.state.value += 10
        thisItem.state.value -= 10
      }
    },
  ),
  new Item(
    "item2",
    {
      value: 25,
    },
    {
      x: 17.65,
      y: 80,
    },
    {
      width: 2,
      aspectRatio: 1 / 3,
    },
    (state) => `background-color: rgba(255, 0, 0, ${state.value / 100});`,
    (thisItem, targetItem, alert) => {
      if (thisItem.state.value < 10) {
        alert("Item 2 has too little value!")
        return
      }
      if (targetItem.name === "item1") {
        targetItem.state.value += 10
        thisItem.state.value -= 10
      }
    },
  ),
])
