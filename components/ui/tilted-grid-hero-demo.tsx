import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";

// Standalone preview with original cover plates only. The live page uses
// components/movies/FilmsHero.tsx, which reads the programme's own artwork.
const IMAGES = [
  "jailer-2",
  "coco-2",
  "wildwood",
  "street-fighter",
  "frozen-iii",
  "godzilla-minus-zero",
].map((slug) => ({
  src: `/cover-art/${slug}.jpg`,
  alt: `Original abstract cover art for ${slug}`,
}));

export default function TiltedGridHeroDemo() {
  return (
    <TiltedGridHero images={IMAGES} style={{ height: 560 }}>
      <div style={{ position: "relative", zIndex: 10, display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <h1>Films</h1>
      </div>
    </TiltedGridHero>
  );
}
