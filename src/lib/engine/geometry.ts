import type { Item, Position } from "./item.svelte"

export function getItemHeightPercent(
  width: number,
  aspectRatio: number,
  parentWidth: number,
  parentHeight: number,
): number {
  if (parentWidth === 0 || parentHeight === 0 || aspectRatio === 0) {
    return width
  }
  return (width * parentWidth) / (parentHeight * aspectRatio)
}

export function getBounds(
  item: Item<any>,
  parentWidth: number,
  parentHeight: number,
) {
  const height = getItemHeightPercent(
    item.dimension.width,
    item.dimension.aspectRatio,
    parentWidth,
    parentHeight,
  )
  return {
    left: item.position.x,
    right: item.position.x + item.dimension.width,
    top: item.position.y,
    bottom: item.position.y + height,
  }
}

export function intersects(
  mouseX: number,
  mouseY: number,
  item: Item<any>,
  parentWidth: number,
  parentHeight: number,
): boolean {
  const bounds = getBounds(item, parentWidth, parentHeight)
  return (
    mouseX >= bounds.left &&
    mouseX <= bounds.right &&
    mouseY >= bounds.top &&
    mouseY <= bounds.bottom
  )
}

export function overlaps(
  a: Item<any>,
  b: Item<any>,
  parentWidth: number,
  parentHeight: number,
): boolean {
  const boundsA = getBounds(a, parentWidth, parentHeight)
  const boundsB = getBounds(b, parentWidth, parentHeight)
  return !(
    boundsA.right <= boundsB.left ||
    boundsA.left >= boundsB.right ||
    boundsA.bottom <= boundsB.top ||
    boundsA.top >= boundsB.bottom
  )
}
