import { Engine, Item } from "./engine.svelte"

export const engine = new Engine([
  new Item<{ substance: string }>(
    "infinite",
    "Big NaOH",
    {
      substance: "NaOH",
    },
    {
      x: 10,
      y: 50,
    },
    {
      width: 10,
      aspectRatio: 1 / 1,
    },
    (state) => `background-color: rgba(255, 0, 0, 1);`,
    (thisItem, targetItem, alert) => {
      if (targetItem.kind == "glass") {
        targetItem.state.substances[thisItem.state.substance] =
          (targetItem.state.substances[thisItem.state.substance] || 0) + 10
      }
    },
  ),
  new Item<{ substance: string }>(
    "infinite",
    "Big H2O",
    {
      substance: "H2O",
    },
    {
      x: 10,
      y: 20,
    },
    {
      width: 10,
      aspectRatio: 1 / 1,
    },
    (state) => `background-color: rgba(0, 255, 0, 1);`,
    (thisItem, targetItem, alert) => {
      if (targetItem.kind == "glass") {
        targetItem.state.substances[thisItem.state.substance] =
          (targetItem.state.substances[thisItem.state.substance] || 0) + 10
      }
    },
  ),
  new Item<{ substances: Record<string, number> }>(
    "glass",
    "Glass 1",
    {
      substances: {} as Record<string, number>,
    },
    {
      x: 17.65,
      y: 80,
    },
    {
      width: 4,
      aspectRatio: 1 / 2,
    },
    (state) => {
      const naohAmount = state.substances["NaOH"] || 0
      const h2oAmount = state.substances["H2O"] || 0
      const totalAmount = naohAmount + h2oAmount
      const naohRatio = totalAmount > 0 ? naohAmount / totalAmount : 0
      const h2oRatio = totalAmount > 0 ? h2oAmount / totalAmount : 0
      return `
        background: linear-gradient(
          to top,
          rgba(255, 0, 0, ${naohRatio}) ${naohRatio * 100}%,
          rgba(0, 255, 0, ${h2oRatio}) ${h2oRatio * 100}%
        );
      `
    },
    (thisItem, targetItem, alert) => {
      if (targetItem.kind == "infinite") {
        alert("You can't put the glass into the infinite source!")
        return
      }

      if (targetItem.kind == "glass") {
        const substances = Object.keys(thisItem.state.substances)
        if (substances.length == 0) return

        const totalAmount = substances.reduce(
          (sum, substance) => sum + thisItem.state.substances[substance],
          0,
        )
        if (totalAmount <= 0) return

        const amountToTransfer = Math.min(10, totalAmount)
        substances.forEach((substance) => {
          const amount = thisItem.state.substances[substance]
          const transferAmount = (amount / totalAmount) * amountToTransfer
          targetItem.state.substances[substance] =
            (targetItem.state.substances[substance] || 0) + transferAmount
          thisItem.state.substances[substance] = Math.max(
            0,
            amount - transferAmount,
          )
        })
      }
      if (targetItem.kind == "spalatorie") {
        thisItem.state.substances = {}
      }
    },
  ),
  new Item<{ substances: Record<string, number> }>(
    "glass",
    "Glass 2",
    {
      substances: {} as Record<string, number>,
    },
    {
      x: 35.65,
      y: 80,
    },
    {
      width: 4,
      aspectRatio: 1 / 2,
    },
    (state) => {
      const naohAmount = state.substances["NaOH"] || 0
      const h2oAmount = state.substances["H2O"] || 0
      const totalAmount = naohAmount + h2oAmount
      const naohRatio = totalAmount > 0 ? naohAmount / totalAmount : 0
      const h2oRatio = totalAmount > 0 ? h2oAmount / totalAmount : 0
      return `
        background: linear-gradient(
          to top,
          rgba(255, 0, 0, ${naohRatio}) ${naohRatio * 100}%,
          rgba(0, 255, 0, ${h2oRatio}) ${h2oRatio * 100}%
        );
      `
    },
    (thisItem, targetItem, alert) => {
      if (targetItem.kind == "infinite") {
        alert("You can't put the glass into the infinite source!")
        return
      }

      if (targetItem.kind == "glass") {
        const substances = Object.keys(thisItem.state.substances)
        if (substances.length == 0) return

        const totalAmount = substances.reduce(
          (sum, substance) => sum + thisItem.state.substances[substance],
          0,
        )
        if (totalAmount <= 0) return

        const amountToTransfer = Math.min(10, totalAmount)
        substances.forEach((substance) => {
          const amount = thisItem.state.substances[substance]
          const transferAmount = (amount / totalAmount) * amountToTransfer
          targetItem.state.substances[substance] =
            (targetItem.state.substances[substance] || 0) + transferAmount
          thisItem.state.substances[substance] = Math.max(
            0,
            amount - transferAmount,
          )
        })
      }

      if (targetItem.kind == "spalatorie") {
        thisItem.state.substances = {}
      }
    },
  ),
  new Item(
    "spalatorie",
    "Spalatorie",
    {},
    {
      x: 80,
      y: 50,
    },
    {
      width: 10,
      aspectRatio: 1 / 2,
    },
    () => `background-color: rgba(0, 0, 255, 1);`,
    (thisItem, targetItem, alert) => {
      if (targetItem.kind == "glass") {
        targetItem.state.substances = {}
      }
    },
  ),
])
