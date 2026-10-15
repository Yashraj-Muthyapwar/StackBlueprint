import { useMemo } from "react";
import type { LessonBuilder } from "@/lessons/types";
import { extractBuilderText } from "@/lib/rivet/context";
import { RivetCompanion } from "./RivetCompanion";

/**
 * Rivet for the animated pattern lessons, which do not use LessonLayout. It
 * builds the lesson text from the lesson builder (once per lesson).
 */
export function BuilderRivet({
  builder,
  patternSlug,
  patternTitle,
}: {
  builder: LessonBuilder;
  patternSlug: string;
  patternTitle: string;
}) {
  const lessonText = useMemo(() => extractBuilderText(builder), [builder]);
  return (
    <RivetCompanion
      context={{
        lessonKey: `/patterns/${patternSlug}/${builder.slug}`,
        trackTitle: "Patterns",
        topicTitle: patternTitle,
        lessonTitle: builder.title.replace(/^[^\u2014]+\u2014\s*/, ""),
        lessonText,
      }}
    />
  );
}
