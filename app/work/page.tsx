import { getAllWork } from "@/lib/work";
import { PastWork } from "@/app/past-work";

export const metadata = {
  title: "Work — Inertia",
  description: "Projects we've shipped.",
};

export default function WorkIndexPage() {
  const work = getAllWork().sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return (
    <main>
      <PastWork work={work} />
    </main>
  );
}
