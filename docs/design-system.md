# Design system

Patterns we reuse across the site. Each entry names the pattern, says where the code lives, and gives the rules for using it.

## Tokens

Colors are RGB triplets on `:root` in `app/globals.css`, redefined for dark mode. Use them as `rgb(var(--token))` or `rgb(var(--token)/alpha)`.

| Token | Use |
| --- | --- |
| `--bg` | Page background, panels drawn inside covers |
| `--surface` | Raised surfaces, card fill at 0.45 alpha, icon chips |
| `--fg` | Primary text, icons, skeleton bars at 0.12 / 0.22 alpha |
| `--muted` | Secondary text, labels, checks |
| `--line` | Borders, 1px ring shadows |

Radius: 6px everywhere (`rounded-[6px]`).

Motion ease: `cubic-bezier(0.22, 1, 0.36, 1)`, 500ms for hover movement. Hover motion is always wrapped in `motion-safe:`.

## Illustrated card (initial design)

A card with a small drawn cover on top and a text block underneath. The cover is an abstract UI illustration: a simplified document or list built from skeleton bars instead of real content. It makes the item read as a real thing you get, not another feature bullet. First shipped on the Aether bonuses (`app/aether/bonuses.tsx`).

Code: `components/illustrated-card.tsx`

```tsx
import { IllustratedCard, SheetCover, RosterCover } from "@/components/illustrated-card";

<IllustratedCard
  as="li"
  cover={<SheetCover icon={<Icon />} />}
  eyebrow="Guide"
  meta="Worth $29"
  title="Getting the most from Aether"
  desc="Which sections to use where, and the settings most stores never touch."
/>
```

### Anatomy

- **Card.** 6px radius, fill `surface/0.45`, no border, `overflow-hidden`. It carries the `group` class that drives cover hover motion.
- **Cover.** `h-32` (`sm:h-36`), hidden from screen readers. A top border on the text block separates it from the cover.
- **Text block.** A muted eyebrow and meta row (12/13px, meta in `tabular-nums`), a title (16/17px, `fg`), and a description (14/15px, `muted`, `text-wrap: pretty`). Everything is `tracking-tight leading-snug`.

### Covers

- **`SheetCover`** is for documents, guides and anything you read. A sheet peeks up from the bottom with a second sheet behind it, rotated -5deg. The sheet has an icon chip, one strong bar for the heading and three body bars at 100 / 92 / 70% width. On hover the front sheet lifts 6px.
- **`RosterCover`** is for lists, contacts and anything you pick from. It shows one row per entry (pass `rows`), each with a square icon mark, a strong bar and a light bar, and a muted check. On hover the gap between rows grows from 2px to 6px.
- **`ILLUSTRATION_BAR`** is the skeleton line class (5px, fully rounded, `fg/0.12`). Use it to draw new covers. Use `fg/0.22` for the "heading" bar.

### Rules

- Keep covers abstract. Use bars, chips and checks, never real text or screenshots.
- Panels inside a cover use `bg` with a 1px `line` ring and the soft drop shadow `0 10px 24px -12px rgb(0 0 0/0.25)`.
- Radius is always 6px: card, panels, rows and icon chips. Only the skeleton bars stay fully rounded.
- Size icons relative to what holds them, never as a fixed px size. In a chip the container sets the size (`[&_svg]:size-[57%]` in the sheet, `50%` in roster marks). Next to text use `size-[1em]` so the icon follows the font size.
- Every hover state needs a touch twin: write `motion-safe:group-hover:X motion-safe:group-data-[play]:X`. On touch screens the card sets `data-play` once it is 60% in view, so the motion plays as you scroll. It resets when the card leaves the screen.
- Motion is small and slow: at most a few pixels, 500ms, on the house ease, and only under `motion-safe`.
- For layout, put cards in a bento grid (`sm:grid-cols-6`) with mixed spans so rows don't read as uniform. Bonuses use span 2 for sheets (three in a row) and span 3 for rosters (two in a row).
- On phones, lay cards out two up with `compactOnMobile`. It gives a shorter cover, tighter padding and no description. If the count is odd, let one card span both columns. Bonuses make the first card full width.
- Use sentence case for eyebrow and title, never all caps.
- For an entrance animation, add `rise rise--liquid` and a staggered `--rise-delay` through `className` and `style`.
