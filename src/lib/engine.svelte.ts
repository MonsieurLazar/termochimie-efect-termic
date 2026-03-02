export type Position = {
  x: number
  y: number
}

export type Dimension = {
  width: number
  height: number
}

export class Item<T> {
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
  isMoving: boolean = false

  redraw = $derived(
    JSON.stringify({
      state: this.state,
      position: this.position,
    }),
  )

  constructor(
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
    this.name = name
    this.state = state
    this.defaultState = state
    this.position = { ...position }
    this.initialPosition = { ...position }
    this.dimension = dimension
    this.draw = draw || this.draw
    this.transition = transition || this.transition
    this.isMoving = false
  }

  getStyles() {
    return `
        user-select: none;
        position: absolute;
        left: ${this.position.x}%;
        top: ${this.position.y}%;
        width: ${this.dimension.width}px;
        height: ${this.dimension.height}px;
        ${!this.isMoving ? "transition: left 0.2s, top 0.2s;" : ""}
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
      this.mouseX = event.clientX - this.parentOffsetX
      this.mouseY = event.clientY - this.parentOffsetY

      this.hoveredItemIndex = null
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i]
        if (i === this.movingItemIndex) continue
        if (this.intersects(this.mouseX, this.mouseY, item)) {
          this.hoveredItemIndex = i
          break
        }
      }

      if (this.movingItemIndex != null) {
        const item = this.items[this.movingItemIndex]
        item.position = {
          x:
            ((this.mouseX - item.dimension.width / 2) / this.parentWidth) * 100,
          y:
            ((this.mouseY - item.dimension.height / 2) / this.parentHeight) *
            100,
        }
        item.position.x = Math.max(
          0,
          Math.min(
            item.position.x,
            100 - (item.dimension.width / this.parentWidth) * 100,
          ),
        )
        item.position.y = Math.max(
          0,
          Math.min(
            item.position.y,
            100 - (item.dimension.height / this.parentHeight) * 100,
          ),
        )
      }
    }

    const mouseDownHandler = (event: MouseEvent) => {
      if (this.hoveredItemIndex == null) return
      this.movingItemIndex = this.hoveredItemIndex
      const item = this.items[this.movingItemIndex]
      item.isMoving = true
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
    }

    document.addEventListener("mousemove", mouseMoveHandler)
    document.addEventListener("mousedown", mouseDownHandler)
    document.addEventListener("mouseup", mouseUpHandler)

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler)
      document.removeEventListener("mousedown", mouseDownHandler)
      document.removeEventListener("mouseup", mouseUpHandler)
    }
  }

  private intersects(mouseX: number, mouseY: number, item: Item<any>): boolean {
    return (
      mouseX >= (item.position.x * this.parentWidth) / 100 &&
      mouseX <=
        (item.position.x * this.parentWidth) / 100 + item.dimension.width &&
      mouseY >= (item.position.y * this.parentHeight) / 100 &&
      mouseY <=
        (item.position.y * this.parentHeight) / 100 + item.dimension.height
    )
  }

  private alert(message: string) {
    alert(message)
  }
}
