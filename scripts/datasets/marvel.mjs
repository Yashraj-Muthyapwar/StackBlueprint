import path from "node:path";
import { readFile } from "node:fs/promises";
import { banner, mb, writeRawFile, writeTable } from "./lib.mjs";

/**
 * Supplied Marvel visualization snapshot. The raw JSON files are retained in
 * public/datasets/marvel/source/ unchanged except for gzip compression. The
 * tables below only project the source's arrays into rows: positional indexes
 * become keys, and nested title/character arrays become child tables.
 */
const SOURCE_FILES = [
  "matrixObject-100-min.json",
  "matrixObject-100.json",
  "matrixObject-alt.json",
  "matrixObject-min.json",
  "matrixObject.json",
  "mcu-film.json",
  "mcu-netflix.json",
  "x-men-film.json",
];

const GRAPH_KINDS = [
  ["comics", "comicsLinks", "comicsMatrix"],
  ["series", "seriesLinks", "seriesMatrix"],
  ["stories", "storiesLinks", "storiesMatrix"],
];

const CATALOGS = [
  ["mcu_film", "mcu-film.json"],
  ["mcu_netflix", "mcu-netflix.json"],
  ["x_men_film", "x-men-film.json"],
];

const CHARACTER_COLUMNS = [
  ["character_id", "INTEGER", true],
  ["name", "TEXT", true],
  ["comic_appearances", "INTEGER", true],
  ["series_appearances", "INTEGER", true],
  ["story_appearances", "INTEGER", true],
];

const LINK_COLUMNS = [
  ["network", "VARCHAR(16)", true],
  ["source_character_id", "INTEGER", true],
  ["target_character_id", "INTEGER", true],
  ["coappearance_count", "INTEGER", true],
];

const TITLE_COLUMNS = [
  ["catalog", "VARCHAR(16)", true],
  ["title_position", "INTEGER", true],
  ["name", "TEXT", true],
  ["wiki", "TEXT"],
  ["series", "TEXT"],
  ["phase", "INTEGER"],
  ["season", "INTEGER"],
  ["released", "VARCHAR(32)"],
  ["poster", "TEXT"],
];

const TITLE_CHARACTER_COLUMNS = [
  ["catalog", "VARCHAR(16)", true],
  ["title_position", "INTEGER", true],
  ["character_position", "INTEGER", true],
  ["name", "TEXT", true],
  ["mainseries", "TEXT"],
];

const END_CREDIT_COLUMNS = [
  ["catalog", "VARCHAR(16)", true],
  ["title_position", "INTEGER", true],
  ["link_position", "INTEGER", true],
  ["linked_title_name", "TEXT", true],
];

const columns = (spec) => spec.map(([name, type, notNull]) => ({ name, type, notNull }));

function expectArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`marvel: expected ${label} to be an array`);
  return value;
}

function expectName(value, label) {
  if (!value || typeof value.name !== "string") {
    throw new Error(`marvel: expected ${label} to have a string name`);
  }
  return value.name;
}

function table(name, file, spec, rows, primaryKey) {
  return {
    schema: "public",
    name,
    file,
    rows,
    primaryKey,
    columns: columns(spec),
  };
}

export async function buildMarvel({ sourceDir } = {}) {
  if (!sourceDir) throw new Error("Marvel requires --marvel-source=/path/to/marvel-data");

  banner("Marvel (supplied source snapshot)");
  const source = new Map();
  for (const filename of SOURCE_FILES) {
    const bytes = await readFile(path.join(sourceDir, filename));
    try {
      source.set(filename, JSON.parse(bytes.toString("utf8")));
    } catch (error) {
      throw new Error(`marvel: ${filename} is not valid JSON (${error.message})`);
    }
    await writeRawFile("marvel", `source/${filename}.gz`, bytes);
  }

  const graph = source.get("matrixObject-alt.json");
  const matrix = source.get("matrixObject.json");
  const nodes = expectArray(graph.nodes, "matrixObject-alt.json nodes");

  const countsByKind = new Map();
  for (const [kind, , matrixKey] of GRAPH_KINDS) {
    const matrixNodes = expectArray(matrix[matrixKey]?.nodes, `${matrixKey}.nodes`);
    if (matrixNodes.length !== nodes.length) {
      throw new Error(`marvel: ${matrixKey} node count does not match matrixObject-alt.json`);
    }
    matrixNodes.forEach((node, index) => {
      if (expectName(node, `${matrixKey}.nodes[${index}]`) !== expectName(nodes[index], `nodes[${index}]`)) {
        throw new Error(`marvel: ${matrixKey} node order does not match matrixObject-alt.json`);
      }
      if (!Number.isInteger(node.count)) {
        throw new Error(`marvel: ${matrixKey}.nodes[${index}].count is not an integer`);
      }
    });
    countsByKind.set(kind, matrixNodes.map((node) => node.count));
  }

  const characterRows = nodes.map((node, index) => [
    index,
    expectName(node, `nodes[${index}]`),
    countsByKind.get("comics")[index],
    countsByKind.get("series")[index],
    countsByKind.get("stories")[index],
  ]);

  const linkRows = [];
  for (const [kind, linksKey] of GRAPH_KINDS) {
    const links = expectArray(graph[linksKey], `matrixObject-alt.json ${linksKey}`);
    links.forEach((link, index) => {
      for (const key of ["source", "target", "value"]) {
        if (!Number.isInteger(link?.[key])) {
          throw new Error(`marvel: ${linksKey}[${index}].${key} is not an integer`);
        }
      }
      if (link.source < 0 || link.source >= nodes.length || link.target < 0 || link.target >= nodes.length) {
        throw new Error(`marvel: ${linksKey}[${index}] has an out-of-range character index`);
      }
      linkRows.push([kind, link.source, link.target, link.value]);
    });
  }

  const titleRows = [];
  const titleCharacterRows = [];
  const endCreditRows = [];
  for (const [catalog, filename] of CATALOGS) {
    const titles = expectArray(source.get(filename).films, `${filename} films`);
    titles.forEach((title, titlePosition) => {
      titleRows.push([
        catalog,
        titlePosition,
        expectName(title, `${filename}.films[${titlePosition}]`),
        title.wiki ?? "",
        title.series ?? "",
        title.phase ?? "",
        title.season ?? "",
        title.released ?? "",
        title.poster ?? "",
      ]);

      expectArray(title.characters, `${filename}.films[${titlePosition}].characters`).forEach(
        (character, characterPosition) => {
          titleCharacterRows.push([
            catalog,
            titlePosition,
            characterPosition,
            expectName(character, `${filename}.films[${titlePosition}].characters[${characterPosition}]`),
            character.mainseries ?? "",
          ]);
        },
      );

      expectArray(title.endCreditsLink ?? [], `${filename}.films[${titlePosition}].endCreditsLink`).forEach(
        (linkedTitleName, linkPosition) => {
          if (typeof linkedTitleName !== "string") {
            throw new Error(`marvel: ${filename}.films[${titlePosition}].endCreditsLink has a non-string entry`);
          }
          endCreditRows.push([catalog, titlePosition, linkPosition, linkedTitleName]);
        },
      );
    });
  }

  const definitions = [
    table("characters", "characters.csv.gz", CHARACTER_COLUMNS, characterRows.length, ["character_id"]),
    table(
      "character_links",
      "character_links.csv.gz",
      LINK_COLUMNS,
      linkRows.length,
      ["network", "source_character_id", "target_character_id"],
    ),
    table("screen_titles", "screen_titles.csv.gz", TITLE_COLUMNS, titleRows.length, ["catalog", "title_position"]),
    table(
      "screen_title_characters",
      "screen_title_characters.csv.gz",
      TITLE_CHARACTER_COLUMNS,
      titleCharacterRows.length,
      ["catalog", "title_position", "character_position"],
    ),
    table(
      "end_credit_links",
      "end_credit_links.csv.gz",
      END_CREDIT_COLUMNS,
      endCreditRows.length,
      ["catalog", "title_position", "link_position"],
    ),
  ];

  const rowsByTable = new Map([
    ["characters", characterRows],
    ["character_links", linkRows],
    ["screen_titles", titleRows],
    ["screen_title_characters", titleCharacterRows],
    ["end_credit_links", endCreditRows],
  ]);

  let totalBytes = 0;
  for (const definition of definitions) {
    const spec = {
      characters: CHARACTER_COLUMNS,
      character_links: LINK_COLUMNS,
      screen_titles: TITLE_COLUMNS,
      screen_title_characters: TITLE_CHARACTER_COLUMNS,
      end_credit_links: END_CREDIT_COLUMNS,
    }[definition.name];
    const stats = await writeTable(
      "marvel",
      definition.name,
      spec.map(([name]) => name),
      rowsByTable.get(definition.name),
    );
    definition.bytes = stats.bytes;
    totalBytes += stats.bytes;
  }

  console.log(
    `  ${definitions.length} tables · ${definitions.reduce((sum, item) => sum + item.rows, 0).toLocaleString()} rows · ${mb(totalBytes)} gzipped`,
  );

  return {
    id: "marvel",
    schemas: [],
    tables: definitions,
    foreignKeys: [
      {
        fromTable: "public.character_links",
        fromColumns: ["source_character_id"],
        toTable: "public.characters",
        toColumns: ["character_id"],
      },
      {
        fromTable: "public.character_links",
        fromColumns: ["target_character_id"],
        toTable: "public.characters",
        toColumns: ["character_id"],
      },
      {
        fromTable: "public.screen_title_characters",
        fromColumns: ["catalog", "title_position"],
        toTable: "public.screen_titles",
        toColumns: ["catalog", "title_position"],
      },
      {
        fromTable: "public.end_credit_links",
        fromColumns: ["catalog", "title_position"],
        toTable: "public.screen_titles",
        toColumns: ["catalog", "title_position"],
      },
    ],
    bytes: totalBytes,
  };
}
