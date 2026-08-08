# Animation assets

| Asset | Role | Source |
| --- | --- | --- |
| `yoga-mat-sprite-sheet.png` | Master 3×3 pixel-art sprite sheet with nine sequential action phases | Generated with GPT-Image from the Yogermeisters hero reference |
| `frame-01.png` … `frame-09.png` | Equal 410×410 crops, ordered left-to-right and top-to-bottom | Cropped from the master sprite sheet |
| `reverse-08.png` … `reverse-01.png` | Render-safe copies used by the reverse playback clips | Copied from their matching forward frames |
| `transparent/frame-01.png` … `transparent/frame-09.png` | Transparent RGBA frames preserving both the heroine and orange mat | Color-keyed from the original generated frames, with the floor line removed |

Character reference: `../../../client/public/assets/landing-v2/cutouts/hero-person-no-bg.png`.

The sequence shows the heroine holding, throwing, landing, and unfolding an orange yoga mat. Playback uses the frames forward, briefly holds the open mat, and returns in reverse for a seamless loop.
