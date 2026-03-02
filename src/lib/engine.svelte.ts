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
  state: T
  initialPosition: Position
  position: Position = $state({ x: 0, y: 0 })
  dimension: Dimension
  draw?: (state: T) => string

  constructor(
    name: string,
    state: T,
    position: Position,
    dimension: Dimension,
    draw?: (state: T) => string,
  ) {
    this.name = name
    this.state = state
    this.defaultState = state
    this.position = position
    this.initialPosition = position
    this.dimension = dimension
    this.draw = draw
  }

  getStyles() {
    return `
        position: absolute;
        left: ${this.position.x}%;
        top: ${this.position.y}%;
        width: ${this.dimension.width}px;
        height: ${this.dimension.height}px;
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
    }

    const mouseUpHandler = (event: MouseEvent) => {
      if (this.movingItemIndex != null) {
        const item = this.items[this.movingItemIndex]
        item.position = structuredClone(item.initialPosition)
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
}
