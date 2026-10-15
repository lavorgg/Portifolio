import type { Metadata } from "next";
import { ProjectsView } from "@/components/ProjectsView";

export const metadata: Metadata = { title: "Projetos de marketing" };

export default function MarketingPage() {
  return <ProjectsView area="mkt" />;
}
