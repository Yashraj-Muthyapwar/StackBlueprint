import type { ExampleGroup } from "./types";

/**
 * Supplied Marvel graph and screen-title snapshot. These queries operate on
 * SQL projections of original JSON arrays; no characters or links are invented.
 */
export const MARVEL_EXAMPLES: ExampleGroup[] = [
  {
    group: "Meet the network",
    blurb: "Characters carry their supplied appearance counts across three Marvel graph views.",
    items: [
      {
        title: "Most-connected comic characters",
        note: "The counts come directly from the source matrix nodes",
        sql: `SELECT character_id,
       name,
       comic_appearances,
       series_appearances,
       story_appearances
FROM characters
ORDER BY comic_appearances DESC, name
LIMIT 30;`,
      },
      {
        title: "How dense is each network?",
        note: "The same character set, three kinds of supplied relationship links",
        sql: `SELECT network,
       COUNT(*) AS character_pairs,
       SUM(coappearance_count) AS total_coappearances,
       ROUND(AVG(coappearance_count), 2) AS avg_per_pair,
       MAX(coappearance_count) AS strongest_pair_count
FROM character_links
GROUP BY network
ORDER BY character_pairs DESC;`,
      },
      {
        title: "Strongest comic co-appearances",
        note: "Join each link to the character at both ends",
        sql: `SELECT source.name AS character_a,
       target.name AS character_b,
       link.coappearance_count
FROM character_links link
JOIN characters source ON source.character_id = link.source_character_id
JOIN characters target ON target.character_id = link.target_character_id
WHERE link.network = 'comics'
ORDER BY link.coappearance_count DESC, character_a, character_b
LIMIT 30;`,
      },
    ],
  },
  {
    group: "Screen titles and casts",
    blurb: "The title arrays are projected into titles, cast rows, and end-credit links.",
    items: [
      {
        title: "Titles by supplied catalog",
        note: "MCU films, Netflix seasons, and X-Men films live in one table",
        sql: `SELECT catalog,
       COUNT(*) AS titles,
       MIN(released) AS first_release,
       MAX(released) AS last_release
FROM screen_titles
GROUP BY catalog
ORDER BY catalog;`,
      },
      {
        title: "Largest supplied casts",
        note: "One row per character listed for each title",
        sql: `SELECT t.catalog,
       t.name AS title,
       t.released,
       COUNT(c.character_position) AS cast_members
FROM screen_titles t
LEFT JOIN screen_title_characters c
  ON c.catalog = t.catalog
 AND c.title_position = t.title_position
GROUP BY t.catalog, t.title_position, t.name, t.released
ORDER BY cast_members DESC, t.name
LIMIT 30;`,
      },
      {
        title: "End-credit destinations",
        note: "The MCU source's endCreditsLink arrays, one destination per row",
        sql: `SELECT t.name AS title,
       t.released,
       e.linked_title_name AS end_credit_destination
FROM end_credit_links e
JOIN screen_titles t
  ON t.catalog = e.catalog
 AND t.title_position = e.title_position
ORDER BY t.catalog, t.title_position, e.link_position;`,
      },
    ],
  },
  {
    group: "Network analysis",
    blurb: "Use a union and aggregation to calculate degree from the raw link endpoints.",
    items: [
      {
        title: "Most-linked characters in comics",
        note: "A link has two endpoints, so count both before ranking",
        sql: `WITH endpoints AS (
  SELECT source_character_id AS character_id,
         coappearance_count
  FROM character_links
  WHERE network = 'comics'
  UNION ALL
  SELECT target_character_id AS character_id,
         coappearance_count
  FROM character_links
  WHERE network = 'comics'
),
degree AS (
  SELECT character_id,
         COUNT(*) AS linked_characters,
         SUM(coappearance_count) AS weighted_links
  FROM endpoints
  GROUP BY character_id
)
SELECT c.name,
       d.linked_characters,
       d.weighted_links,
       RANK() OVER (ORDER BY d.weighted_links DESC) AS network_rank
FROM degree d
JOIN characters c ON c.character_id = d.character_id
ORDER BY network_rank, c.name
LIMIT 30;`,
      },
      {
        title: "Compare comic and story presence",
        note: "A simple ratio reveals characters with different kinds of coverage",
        sql: `SELECT name,
       comic_appearances,
       story_appearances,
       ROUND(1.0 * comic_appearances / NULLIF(story_appearances, 0), 2) AS comic_to_story_ratio
FROM characters
WHERE comic_appearances >= 100
  AND story_appearances > 0
ORDER BY comic_to_story_ratio DESC, name
LIMIT 30;`,
      },
    ],
  },
];
