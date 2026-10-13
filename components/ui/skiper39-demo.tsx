import Skiper39 from "@/components/ui/skiper39";

// Standalone preview of the crowd canvas. The live site renders CrowdCanvas in the footer
// (components/layout/SiteFooter.tsx); this file exists so the effect can be shown alone.
export default function Skiper39Demo() {
  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <Skiper39 />
    </div>
  );
}
