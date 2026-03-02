export type Position = {
  x: number
  y: number
}

export type Dimension = {
  width: number
  aspectRatio: number
}

export class Item<T> {
  kind: string = "unknown"
  name: string
  defaultState: T
  state: T = $state({} as T)
  initialPosition: Position
  position: Position = $state({ x: 0, y: 0 })
  dimension: Dimension
  draw: (state: T) => string = () => ""
  transition: (
    thisItem: Item<T>,
    targetItem: Item<any>,
    alert: (message: string) => void,
  ) => void = () => {}
  isMoving: boolean = $state(false)
  isHovered: boolean = $state(false)

  constructor(
    kind: string,
    name: string,
    state: T,
    position: Position,
    dimension: Dimension,
    draw?: (state: T) => string,
    transition?: (
      thisItem: Item<T>,
      targetItem: Item<any>,
      alert: (message: string) => void,
    ) => void,
  ) {
    this.kind = kind
    this.name = name
    this.state = state
    this.defaultState = state
    this.position = { ...position }
    this.initialPosition = { ...position }
    this.dimension = dimension
    this.draw = draw || this.draw
    this.transition = transition || this.transition
    this.isMoving = false
    this.isHovered = false
  }

  getStyles() {
    return `
        user-select: none;
        position: absolute;
        left: ${this.position.x}%;
        top: ${this.position.y}%;
        width: ${this.dimension.width}%;
        aspect-ratio: ${this.dimension.aspectRatio};
        ${!this.isMoving ? "transition: left 0.2s, top 0.2s;" : ""}
        ${this.isHovered ? "outline: 2px solid blue;" : ""}
        ${this.isMoving ? "z-index: 1000;" : ""}
        ${this.draw ? this.draw(this.state) : ""}
        `
  }
}

export class Engine {
  items: Item<any>[] = []

  parent: HTMLElement | null = null
  parentOffsetX: number = 0
  parentOffsetY: number = 0
  parentWidth: number = 0
  parentHeight: number = 0

  mouseX: number = $state(0)
  mouseY: number = $state(0)

  hoveredItemIndex: number | null = $state(null)
  movingItemIndex: number | null = $state(null)
  movingOffset: Position = { x: 0, y: 0 }
  constructor(items: Item<any>[]) {
    this.items = items
  }

  init(parent: HTMLElement): () => void {
    this.parent = parent
    this.parentOffsetX = parent.offsetLeft
    this.parentOffsetY = parent.offsetTop
    this.parentWidth = parent.offsetWidth
    this.parentHeight = parent.offsetHeight

    const mouseMoveHandler = (event: MouseEvent) => {
      if (!this.parentWidth || !this.parentHeight) return
      const normalizedMouseX =
        ((event.clientX - this.parentOffsetX) / this.parentWidth) * 100
      const normalizedMouseY =
        ((event.clientY - this.parentOffsetY) / this.parentHeight) * 100
      this.mouseX = Math.max(0, Math.min(100, normalizedMouseX))
      this.mouseY = Math.max(0, Math.min(100, normalizedMouseY))

      if (this.movingItemIndex != null) {
        const item = this.items[this.movingItemIndex]
        const widthPercent = item.dimension.width
        const heightPercent = this.getItemHeightPercent(item)
        const targetX = this.mouseX - this.movingOffset.x
        const targetY = this.mouseY - this.movingOffset.y
        item.position.x = Math.max(0, Math.min(100 - widthPercent, targetX))
        item.position.y = Math.max(0, Math.min(100 - heightPercent, targetY))
        this.clearHovered()
        const overlappingIndex = this.findOverlappingItemIndex(
          this.movingItemIndex,
        )
        if (overlappingIndex != null) {
          this.markHovered(overlappingIndex)
        }
        return
      }

      this.clearHovered()
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i]
        if (this.intersects(this.mouseX, this.mouseY, item)) {
          this.markHovered(i)
          break
        }
      }
    }

    const mouseDownHandler = (event: MouseEvent) => {
      if (this.hoveredItemIndex == null) return
      this.movingItemIndex = this.hoveredItemIndex
      const item = this.items[this.movingItemIndex]
      item.isMoving = true
      this.movingOffset = {
        x: this.mouseX - item.position.x,
        y: this.mouseY - item.position.y,
      }
    }

    const mouseUpHandler = (event: MouseEvent) => {
      if (
        this.movingItemIndex != null &&
        this.hoveredItemIndex != null &&
        this.movingItemIndex !== this.hoveredItemIndex
      ) {
        const movingItem = this.items[this.movingItemIndex]
        const targetItem = this.items[this.hoveredItemIndex]
        if (!movingItem || !targetItem) return
        movingItem.transition(movingItem, targetItem, this.alert.bind(this))
      }
      if (this.movingItemIndex != null) {
        const movingItem = this.items[this.movingItemIndex]
        movingItem.position = structuredClone(movingItem.initialPosition)
        movingItem.isMoving = false
      }
      this.movingItemIndex = null
      this.movingOffset = { x: 0, y: 0 }
    }

    const resizeHandler = () => {
      if (!this.parent) return
      this.parentWidth = this.parent.offsetWidth
      this.parentHeight = this.parent.offsetHeight
      this.parentOffsetX = this.parent.offsetLeft
      this.parentOffsetY = this.parent.offsetTop
    }

    document.addEventListener("mousemove", mouseMoveHandler)
    document.addEventListener("mousedown", mouseDownHandler)
    document.addEventListener("mouseup", mouseUpHandler)
    window.addEventListener("resize", resizeHandler)

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler)
      document.removeEventListener("mousedown", mouseDownHandler)
      document.removeEventListener("mouseup", mouseUpHandler)
      window.removeEventListener("resize", resizeHandler)
    }
  }

  private intersects(mouseX: number, mouseY: number, item: Item<any>): boolean {
    const heightPercent = this.getItemHeightPercent(item)
    return (
      mouseX >= item.position.x &&
      mouseX <= item.position.x + item.dimension.width &&
      mouseY >= item.position.y &&
      mouseY <= item.position.y + heightPercent
    )
  }

  private getItemHeightPercent(item: Item<any>): number {
    if (
      this.parentWidth === 0 ||
      this.parentHeight === 0 ||
      item.dimension.aspectRatio === 0
    ) {
      return item.dimension.width
    }

    return (
      (item.dimension.width * this.parentWidth) /
      (this.parentHeight * item.dimension.aspectRatio)
    )
  }

  private clearHovered() {
    if (this.hoveredItemIndex != null) {
      this.items[this.hoveredItemIndex].isHovered = false
      this.hoveredItemIndex = null
    }
  }

  private markHovered(index: number) {
    this.hoveredItemIndex = index
    this.items[index].isHovered = true
  }

  private findOverlappingItemIndex(movingIndex: number): number | null {
    const movingItem = this.items[movingIndex]
    for (let i = 0; i < this.items.length; i++) {
      if (i === movingIndex) continue
      const item = this.items[i]
      if (this.itemsOverlap(movingItem, item)) {
        return i
      }
    }
    return null
  }

  private itemsOverlap(a: Item<any>, b: Item<any>): boolean {
    const boundsA = this.getItemBounds(a)
    const boundsB = this.getItemBounds(b)
    return !(
      boundsA.right <= boundsB.left ||
      boundsA.left >= boundsB.right ||
      boundsA.bottom <= boundsB.top ||
      boundsA.top >= boundsB.bottom
    )
  }

  private getItemBounds(item: Item<any>) {
    const heightPercent = this.getItemHeightPercent(item)
    return {
      left: item.position.x,
      right: item.position.x + item.dimension.width,
      top: item.position.y,
      bottom: item.position.y + heightPercent,
    }
  }

  private alert(message: string) {
    alert(message)
  }
}
