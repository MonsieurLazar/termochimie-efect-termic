import { Item, type Position } from "./item.svelte"
import { intersects, overlaps, getItemHeightPercent } from "./geometry"

export type EngineState = "idle" | "carrying" | "pouring"

export class Engine {
  items: Item<any>[] = []
  parent: HTMLElement | null = null
  parentMetrics = { x: 0, y: 0, w: 0, h: 0 }

  mouseX: number = $state(0)
  mouseY: number = $state(0)
  hoveredItemIndex: number | null = $state(null)
  engineState: EngineState = $state("idle")
  carriedItemIndex: number | null = $state(null)
  pourTargetIndex: number | null = $state(null)
  pouringAmount: number = $state(0)

  private carryOffset: Position = { x: 0, y: 0 }
  private pourAnimationId: number | null = null
  private engineTickId: number | null = null
  private lastTickTimestamp: number = 0
  private lastPourTimestamp: number = 0
  private pourStartedThisMousedown: boolean = false

  constructor(items: Item<any>[]) {
    this.items = items
  }

  init(parent: HTMLElement): () => void {
    this.parent = parent
    this.updateMetrics()

    const handlers = {
      mousemove: (e: MouseEvent) => this.handleMouseMove(e),
      mousedown: (e: MouseEvent) => this.handleMouseDown(e),
      mouseup: (e: MouseEvent) => this.handleMouseUp(e),
      click: (e: MouseEvent) => this.handleClick(e),
      resize: () => this.updateMetrics(),
      scroll: () => this.updateMetrics(),
    }

    Object.entries(handlers).forEach(([evt, fn]) => {
      const target = evt === "scroll" ? window : document
      target.addEventListener(evt, fn as any, evt === "scroll" ? true : false)
    })

    this.startEngineTick()

    return () => {
      this.stopEngineTick()
      Object.entries(handlers).forEach(([evt, fn]) => {
        const target = evt === "scroll" ? window : document
        target.removeEventListener(evt, fn as any, evt === "scroll" ? true : false)
      })
    }
  }

  private updateMetrics = () => {
    if (!this.parent) return
    const rect = this.parent.getBoundingClientRect()
    this.parentMetrics = {
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
    }
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.parentMetrics.w || !this.parentMetrics.h) return

    this.mouseX = Math.max(
      0,
      Math.min(
        100,
        ((event.clientX - this.parentMetrics.x) / this.parentMetrics.w) * 100,
      ),
    )
    this.mouseY = Math.max(
      0,
      Math.min(
        100,
        ((event.clientY - this.parentMetrics.y) / this.parentMetrics.h) * 100,
      ),
    )

    if (this.engineState === "carrying") {
      this.updateCarriedPosition()
    } else if (this.engineState === "idle") {
      this.updateHoverState()
    }
  }

  private updateCarriedPosition() {
    const item = this.items[this.carriedItemIndex!]
    const hPercent = getItemHeightPercent(
      item.dimension.width,
      item.dimension.aspectRatio,
      this.parentMetrics.w,
      this.parentMetrics.h,
    )

    item.position.x = Math.max(
      0,
      Math.min(100 - item.dimension.width, this.mouseX - this.carryOffset.x),
    )
    item.position.y = Math.max(
      0,
      Math.min(100 - hPercent, this.mouseY - this.carryOffset.y),
    )

    this.clearHovered()
    const overlapIdx = this.items.findIndex(
      (t, i) =>
        i !== this.carriedItemIndex &&
        overlaps(item, t, this.parentMetrics.w, this.parentMetrics.h),
    )

    if (
      overlapIdx !== -1 &&
      item.canTransition(item, this.items[overlapIdx]) !== false
    ) {
      this.markHovered(overlapIdx)
    }
  }

  private updateHoverState() {
    this.clearHovered()
    const hoverIdx = this.items.findIndex((item) =>
      intersects(
        this.mouseX,
        this.mouseY,
        item,
        this.parentMetrics.w,
        this.parentMetrics.h,
      ),
    )
    if (hoverIdx !== -1) this.markHovered(hoverIdx)
  }

  private handleMouseDown(event: MouseEvent) {
    if (
      this.engineState === "carrying" &&
      this.hoveredItemIndex !== null &&
      this.hoveredItemIndex !== this.carriedItemIndex
    ) {
      const carried = this.items[this.carriedItemIndex!]
      const target = this.items[this.hoveredItemIndex]
      if (carried.canTransition(carried, target) === "continuous") {
        this.pourTargetIndex = this.hoveredItemIndex
        this.startPouring()
        this.pourStartedThisMousedown = true
      }
    }
  }

  private handleMouseUp(event: MouseEvent) {
    if (this.engineState === "pouring") {
      this.stopPouring()
      this.returnCarriedItem()
      this.engineState = "idle"
    }
  }

  private handleClick(event: MouseEvent) {
    if (this.pourStartedThisMousedown) {
      this.pourStartedThisMousedown = false
      return
    }

    if (this.engineState === "idle" && this.hoveredItemIndex !== null) {
      this.pickUp(this.hoveredItemIndex)
    } else if (this.engineState === "carrying") {
      this.handleCarriedClick()
    }
  }

  private pickUp(index: number) {
    this.carriedItemIndex = index
    const item = this.items[index]
    item.isMoving = true
    this.carryOffset = {
      x: this.mouseX - item.position.x,
      y: this.mouseY - item.position.y,
    }
    this.engineState = "carrying"
  }

  private handleCarriedClick() {
    if (
      this.hoveredItemIndex !== null &&
      this.hoveredItemIndex !== this.carriedItemIndex
    ) {
      const carried = this.items[this.carriedItemIndex!]
      const target = this.items[this.hoveredItemIndex]
      if (carried.canTransition(carried, target) === "instant") {
        carried.transition(carried, target, (m) => alert(m))
      }
    }
    this.returnCarriedItem()
    this.engineState = "idle"
  }

  private startPouring() {
    this.engineState = "pouring"
    this.lastPourTimestamp = performance.now()
    this.pouringAmount = 0
    const loop = (now: number) => {
      const delta = now - this.lastPourTimestamp
      this.lastPourTimestamp = now
      const carried = this.items[this.carriedItemIndex!]
      const target = this.items[this.pourTargetIndex!]
      carried.transition(carried, target, (m) => alert(m), delta)
      this.pouringAmount += delta / 1000

      if (carried.canTransition(carried, target) !== "continuous") {
        this.stopPouring()
        this.returnCarriedItem()
        this.engineState = "idle"
        return
      }

      this.pourAnimationId = requestAnimationFrame(loop)
    }
    this.pourAnimationId = requestAnimationFrame(loop)
  }

  private stopPouring() {
    if (this.pourAnimationId !== null)
      cancelAnimationFrame(this.pourAnimationId)
    this.pourAnimationId = null
    this.pourTargetIndex = null
  }

  private returnCarriedItem() {
    if (this.carriedItemIndex !== null) {
      const item = this.items[this.carriedItemIndex]
      item.position = structuredClone(item.initialPosition)
      item.isMoving = false
    }
    this.carriedItemIndex = null
    this.clearHovered()
  }

  private clearHovered() {
    if (this.hoveredItemIndex !== null) {
      this.items[this.hoveredItemIndex].isHovered = false
      this.hoveredItemIndex = null
    }
  }

  private markHovered(index: number) {
    this.hoveredItemIndex = index
    this.items[index].isHovered = true
  }

  private startEngineTick() {
    this.lastTickTimestamp = performance.now()
    const loop = (now: number) => {
      const deltaMs = now - this.lastTickTimestamp
      this.lastTickTimestamp = now

      this.items.forEach((item) => {
        item.tick(item, this, deltaMs)
      })

      this.engineTickId = requestAnimationFrame(loop)
    }
    this.engineTickId = requestAnimationFrame(loop)
  }

  private stopEngineTick() {
    if (this.engineTickId !== null) cancelAnimationFrame(this.engineTickId)
    this.engineTickId = null
  }
}
