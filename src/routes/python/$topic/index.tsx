import { createFileRoute } from "@tanstack/react-router";
import { PYTHON_SECTIONS } from "../index";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/python/$topic/")({
  component: PythonTopicPage,
});

function PythonTopicPage() {
  const { topic } = Route.useParams();
  const t = PYTHON_SECTIONS.flatMap((s) => s.patterns).find((p) => p.slug === topic);

  return <ChapterIndexLayout trackTitle="Python" trackPath="/python" topic={t as any} />;
}
