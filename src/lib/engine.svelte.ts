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
  position: Position
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

  hoveredItemIndex: number | null = $state(null)
  constructor(items: Item<any>[]) {
    this.items = items
  }

  markHoveredItem(index: number | null) {
    this.hoveredItemIndex = index
  }
}
