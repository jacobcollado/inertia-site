import type { Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WorkMeta } from "@/lib/work";

// A piece of work as a card, shared by the homepage and /work so the two
// never drift apart: the photo, and the client's name on a sheet of clear
// glass across its foot, with the line about the work opening under it on
// hover. Styles are .index-tile in globals.css; the glass needs <TileGlass />
// once on the page.

export type TileWork = {
  slug: string;
  client: string;
  blurb?: string;
  image: string;
};

// The card's photo: the project's card art, else its first shot.
export function tileImage(w: WorkMeta): string | undefined {
  return w.card ?? w.cover ?? w.images?.[0];
}

export function toTileWork(w: WorkMeta): TileWork | null {
  const image = tileImage(w);
  return image ? { slug: w.slug, client: w.client, blurb: w.blurb ?? w.summary, image } : null;
}

export function WorkTile({
  work: w,
  sizes,
  priority = false,
  landed = true,
  pane = false,
  ref,
}: {
  work: TileWork;
  sizes: string;
  // Above the fold: load at once, first.
  priority?: boolean;
  // The homepage's cards fly into place; until one has landed it is hidden
  // and can't be hovered or clicked.
  landed?: boolean;
  // ?glass=pane on the homepage: the earlier crisp-edged pane, kept to
  // compare against.
  pane?: boolean;
  ref?: Ref<HTMLAnchorElement>;
}) {
  return (
    <Link ref={ref} href={`/work/${w.slug}`} className="index-tile" data-landed={landed ? "true" : "false"}>
      <span data-frame className="index-tile__frame">
        <Image src={w.image} alt="" fill sizes={sizes} loading={priority ? "eager" : undefined} fetchPriority={priority ? "high" : undefined} className="object-cover" />
        {/* A sheet of clear glass over the card's foot: the same photo
            again, exactly over the first, bent by #tile-glass. The bend
            grows from nothing partway down the card, so the sheet has no
            edge and the photo is never shown twice. */}
        {!pane && (
          <span className="index-tile__sheet" aria-hidden>
            <Image src={w.image} alt="" fill sizes={sizes} className="object-cover" />
          </span>
        )}
        <span className="index-tile__label">
          {pane && (
            <span className="index-tile__glass" aria-hidden>
              <span className="index-tile__glass-photo">
                <Image src={w.image} alt="" fill sizes={sizes} className="object-cover" />
              </span>
            </span>
          )}
          <span className="index-tile__name">{w.client}</span>
          {w.blurb ? (
            <span className="index-tile__more">
              <span className="index-tile__blurb">{w.blurb}</span>
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

// How strongly the cards' glass bends the photo, down the card: none above
// 50% of its height, easing to full by 78%.
const GLASS_RAMP =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' preserveAspectRatio='none'>" +
      "<linearGradient id='r' x1='0' y1='0' x2='0' y2='1'>" +
      "<stop offset='0.5' stop-color='#000'/><stop offset='0.6' stop-color='#262626'/>" +
      "<stop offset='0.7' stop-color='#a0a0a0'/><stop offset='0.78' stop-color='#fff'/>" +
      "</linearGradient><rect width='1' height='1' fill='url(#r)'/></svg>",
  );

// The cards' glass, once per page. #tile-glass bends the sheet with a slow,
// low ripple, softens it and darkens it very slightly, all ramping from none
// at 50% of the card's height to full at 78%: the ripple is mixed toward
// neutral grey (no shift) by GLASS_RAMP, a top-to-bottom gradient, which also
// masks the softened copy in. #tile-glass-pane is the plain ripple behind
// the pane variant.
export function TileGlass() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="tile-glass" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.016" numOctaves="2" seed="7" result="ripple" />
        <feColorMatrix in="ripple" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" result="opaque" />
        <feImage href={GLASS_RAMP} preserveAspectRatio="none" result="ramp" />
        <feComposite in="opaque" in2="ramp" operator="arithmetic" k1="1" k2="0" k3="-0.5" k4="0.5" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G" result="bent" />
        <feGaussianBlur in="bent" stdDeviation="1.6" result="blurred" />
        <feComponentTransfer in="blurred" result="soft">
          <feFuncR type="linear" slope="0.88" />
          <feFuncG type="linear" slope="0.88" />
          <feFuncB type="linear" slope="0.88" />
        </feComponentTransfer>
        <feColorMatrix in="ramp" type="luminanceToAlpha" result="rampAlpha" />
        <feComposite in="soft" in2="rampAlpha" operator="in" result="softGlass" />
        <feComposite in="softGlass" in2="bent" operator="over" />
      </filter>
      <filter id="tile-glass-pane" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.016" numOctaves="2" seed="7" result="ripple" />
        <feDisplacementMap in="SourceGraphic" in2="ripple" scale="10" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
