#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path

from PIL import Image


ALPHA_THRESHOLD = 8


def crop_transparent_pixels(png_path: Path) -> bool:
    with Image.open(png_path) as image:
        rgba = image.convert("RGBA")
        alpha = rgba.getchannel("A")
        mask = alpha.point(lambda value: 255 if value > ALPHA_THRESHOLD else 0)
        bounding_box = mask.getbbox()

        if bounding_box is None:
            return False

        cropped = rgba.crop(bounding_box)
        if cropped.size == image.size:
            return False

        cropped.save(png_path)
        return True


def main() -> None:
    root = Path(__file__).resolve().parent
    png_paths = sorted(root.rglob("*.png"))

    changed_count = 0
    skipped_count = 0

    for png_path in png_paths:
        if crop_transparent_pixels(png_path):
            changed_count += 1
            print(f"cropped: {png_path.relative_to(root)}")
        else:
            skipped_count += 1

    print(f"done: cropped={changed_count}, skipped={skipped_count}, total={len(png_paths)}")


if __name__ == "__main__":
    main()
