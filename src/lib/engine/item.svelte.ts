import type { Component } from "svelte"
import DefaultItemRenderer from "./ui/DefaultItemRenderer.svelte"

export type Position = {
  x: number
  y: number
}

export type Dimension = {
  width: number
  aspectRatio: number
}

export type TransitionType = "instant" | "continuous" | false

export class Item<T> {
  kind: string = "unknown"
  name: string
  defaultState: T
  state: T = $state({} as T)
  initialPosition: Position
  position: Position = $state({ x: 0, y: 0 })
  dimension: Dimension
  renderComponent: Component<any> = DefaultItemRenderer as any
  draw: (state: T) => string = () => ""
  tick: (
    thisItem: Item<T>,
    engine: any,
    deltaMs: number,
  ) => void = () => {}
  transition: (
    thisItem: Item<T>,
    targetItem: Item<any>,
    alert: (message: string) => void,
    deltaMs?: number,
  ) => void = () => {}
  canTransition: (
    thisItem: Item<T>,
    targetItem: Item<any>,
  ) => TransitionType = () => "instant" 
  onClick: (thisItem: Item<T>, engine: any) => void = () => {}
  isMoving: boolean = $state(false)
  isHovered: boolean = $state(false)
  imageUrl?: string = $state("")
  color: string = $state("")

  constructor(
    kind: string,
    name: string,
    state: T,
    position: Position,
    dimension: Dimension,
    renderComponent?: Component<any>,
    draw?: (state: T) => string,
    tick?: (
      thisItem: Item<T>,
      engine: any,
      deltaMs: number,
    ) => void,
    transition?: (
      thisItem: Item<T>,
      targetItem: Item<any>,
      alert: (message: string) => void,
      deltaMs?: number,
    ) => void,
    canTransition?: (
      thisItem: Item<T>,
      targetItem: Item<any>,
    ) => TransitionType,
    onClick?: (thisItem: Item<T>, engine: any) => void,
    imageUrl?: string,
    color?: string
  ) {
    this.imageUrl = imageUrl;
    this.color = color || "";
    this.kind = kind
    this.name = name
    this.state = state
    this.defaultState = state
    this.position = { ...position }
    this.initialPosition = { ...position }
    this.dimension = dimension
    this.renderComponent = renderComponent || this.renderComponent
    this.draw = draw || this.draw
    this.tick = tick || this.tick
    this.transition = transition || this.transition
    this.canTransition = canTransition || this.canTransition
    this.onClick = onClick || this.onClick
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
        ${this.isMoving ? "z-index: 1000;" : ""}
        ${this.draw ? this.draw(this.state) : ""}
        `
  }

  getDisplayImageUrl() {
    if (!this.imageUrl || !this.isHovered) return this.imageUrl
    if (!this.imageUrl.endsWith(".png")) return this.imageUrl
    return this.imageUrl.replace(/\.png$/i, "_hover.png")
  }
}
