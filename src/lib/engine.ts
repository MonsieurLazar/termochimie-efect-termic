export type Position = {
  x: number
  y: number
}

export class Item<T> {
  name: string
  defaultState: T
  state: T
  position: Position
  constructor(name: string, state: T, position: Position) {
    this.name = name
    this.state = state
    this.defaultState = state
    this.position = position
  }

  getStyles() {
    return `
          position: absolute;
          left: ${this.position.x}%;
          top: ${this.position.y}%;
        `
  }
}

export class Engine {
  items: Item<any>[] = []
  constructor(items: Item<any>[]) {
    this.items = items
  }
}
