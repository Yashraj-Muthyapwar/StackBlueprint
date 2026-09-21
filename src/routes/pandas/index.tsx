import { createFileRoute } from "@tanstack/react-router";
import { Table, Filter, Combine } from "lucide-react";
import pandasLogo from "@/images/logos/pandas-logo.svg";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";

export const Route = createFileRoute("/pandas/")({
  head: () => ({
    meta: [
      { title: "Pandas — StackBlueprint" },
      {
        name: "description",
        content: "Master data manipulation and analysis with Pandas.",
      },
      { property: "og:title", content: "Pandas — StackBlueprint" },
      {
        property: "og:description",
        content: "Master data manipulation and analysis with Pandas.",
      },
    ],
  }),
  component: PandasIndex,
});

export const PANDAS_SECTIONS = [
  {
    title: "1. Core Operations",
    blurb: "The essential building blocks of Pandas.",
    patterns: [
      {
        slug: "dataframes-series",
        title: "DataFrames & Series",
        blurb: "Core Pandas data structures and basic operations.",
        locked: false,
        lessons: [
          { slug: "creating-series", title: "Creating Series", icon: Table },
          { slug: "creating-dataframes", title: "Creating DataFrames", icon: Table },
          { slug: "indexing", title: "Indexing and Selection", icon: Table },
          { slug: "basic-operations", title: "Basic Operations", icon: Table },
        ],
      },
      {
        slug: "data-cleaning",
        title: "Data Cleaning",
        blurb: "Handling missing values, duplicates, and data types.",
        locked: false,
        lessons: [
          { slug: "missing-data", title: "Handling Missing Data", icon: Filter },
          { slug: "duplicates", title: "Removing Duplicates", icon: Filter },
          { slug: "data-types", title: "Data Type Conversions", icon: Filter },
        ],
      },
      {
        slug: "data-aggregation",
        title: "Data Aggregation",
        blurb: "Group by, merge, join, and pivot tables.",
        locked: false,
        lessons: [
          { slug: "groupby", title: "GroupBy Operations", icon: Combine },
          { slug: "merging", title: "Merging and Joining", icon: Combine },
          { slug: "pivot-tables", title: "Pivot Tables", icon: Combine },
        ],
      },
    ],
  },
];

function PandasIndex() {
  return (
    <TrackIndexLayout
      title="Pandas"
      blurb="Master data manipulation and analysis with Pandas."
      logoSrc={pandasLogo}
      basePath="/pandas"
      sections={PANDAS_SECTIONS}
    />
  );
}
