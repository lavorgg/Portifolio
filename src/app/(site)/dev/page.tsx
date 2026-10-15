import type { Metadata } from "next";
import { ProjectsView } from "@/components/ProjectsView";

export const metadata: Metadata = { title: "Projetos de programação" };

export default function DevPage() {
  return <ProjectsView area="dev" />;
}
