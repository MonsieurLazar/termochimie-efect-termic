#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path

from PIL import Image


ALPHA_THRESHOLD = 8
EDGE_COLOR = (255, 48, 48)
EDGE_ALPHA = 255
HOVER_SUFFIX = "_hover"
BORDER_THICKNESS_PX = 2


def build_hover_image(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > ALPHA_THRESHOLD else 0)

    pixels = rgba.load()
    mask_pixels = mask.load()

    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            if mask_pixels[x, y] > 0:
                continue

            near_opaque = False
            for dy in range(-BORDER_THICKNESS_PX, BORDER_THICKNESS_PX + 1):
                ny = y + dy
                if ny < 0 or ny >= height:
                    continue

                for dx in range(-BORDER_THICKNESS_PX, BORDER_THICKNESS_PX + 1):
                    nx = x + dx
                    if nx < 0 or nx >= width:
                        continue

                    if max(abs(dx), abs(dy)) <= BORDER_THICKNESS_PX and mask_pixels[nx, ny] > 0:
                        near_opaque = True
                        break

                if near_opaque:
                    break

            if near_opaque:
                pixels[x, y] = (*EDGE_COLOR, EDGE_ALPHA)

    return rgba


def source_png_paths(root: Path) -> list[Path]:
    return sorted(
        p for p in root.rglob("*.png") if not p.stem.endswith(HOVER_SUFFIX)
    )


def to_hover_path(png_path: Path) -> Path:
    return png_path.with_name(f"{png_path.stem}{HOVER_SUFFIX}.png")


def main() -> None:
    root = Path(__file__).resolve().parent
    png_paths = source_png_paths(root)

    written_count = 0
    for png_path in png_paths:
        with Image.open(png_path) as image:
            hover_image = build_hover_image(image)

        hover_path = to_hover_path(png_path)
        hover_image.save(hover_path)
        written_count += 1
        print(f"generated: {hover_path.relative_to(root)}")

    print(
        f"done: generated={written_count}, total={len(png_paths)}"
    )


if __name__ == "__main__":
    main()
