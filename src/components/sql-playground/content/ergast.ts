import type { ExampleGroup } from "./types";

/**
 * Ergast Formula 1 archive, 1950 through 2024. Source identifiers are
 * normalized to lower snake_case when the data bundle is built.
 */
export const ERGAST_EXAMPLES: ExampleGroup[] = [
  {
    group: "Start on the grid",
    blurb: "Learn the archive from its season, race, driver and constructor dimensions.",
    items: [
      {
        title: "Explore the Formula 1 tables",
        note: "The catalogue is queryable too",
        sql: `SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;`,
      },
      {
        title: "The 2024 calendar",
        note: "Races joined to the circuits that hosted them",
        sql: `SELECT r.round,
       r.name AS grand_prix,
       r.date,
       c.name AS circuit,
       c.location,
       c.country
FROM races r
JOIN circuits c ON c.circuit_id = r.circuit_id
WHERE r.year = 2024
ORDER BY r.round;`,
      },
      {
        title: "Drivers and their nationalities",
        note: "A small projection from the driver dimension",
        sql: `SELECT driver_id,
       forename || ' ' || surname AS driver,
       code,
       nationality,
       dob
FROM drivers
ORDER BY surname, forename
LIMIT 30;`,
      },
    ],
  },
  {
    group: "Season stories",
    blurb: "Championship tables record the position after every race, not just the finale.",
    items: [
      {
        title: "2024 drivers' championship",
        note: "Take the final standing recorded in the season",
        sql: `WITH final_race AS (
  SELECT MAX(round) AS round
  FROM races
  WHERE year = 2024
)
SELECT ds.position,
       d.forename || ' ' || d.surname AS driver,
       ds.points,
       ds.wins
FROM driver_standings ds
JOIN races r ON r.race_id = ds.race_id
JOIN final_race fr ON fr.round = r.round
JOIN drivers d ON d.driver_id = ds.driver_id
WHERE r.year = 2024
ORDER BY ds.position;`,
      },
      {
        title: "2024 constructors' championship",
        note: "The final post-race team standings",
        sql: `WITH final_race AS (
  SELECT MAX(round) AS round
  FROM races
  WHERE year = 2024
)
SELECT cs.position,
       c.name AS constructor,
       cs.points,
       cs.wins
FROM constructor_standings cs
JOIN races r ON r.race_id = cs.race_id
JOIN final_race fr ON fr.round = r.round
JOIN constructors c ON c.constructor_id = cs.constructor_id
WHERE r.year = 2024
ORDER BY cs.position;`,
      },
      {
        title: "Race winners by season",
        note: "Each row in results is one driver's classification in one race",
        sql: `SELECT r.year,
       d.forename || ' ' || d.surname AS driver,
       COUNT(*) AS wins
FROM results re
JOIN races r ON r.race_id = re.race_id
JOIN drivers d ON d.driver_id = re.driver_id
WHERE re.position = 1
  AND r.year >= 2014
GROUP BY r.year, d.forename, d.surname
ORDER BY r.year DESC, wins DESC, driver;`,
      },
    ],
  },
  {
    group: "Race performance",
    blurb: "Compare qualifying, starting positions and final classifications at the correct race-driver grain.",
    items: [
      {
        title: "2024 podium finishers",
        note: "A four-table join at one result per driver per race",
        sql: `SELECT r.round,
       r.name AS grand_prix,
       re.position,
       d.forename || ' ' || d.surname AS driver,
       c.name AS constructor
FROM results re
JOIN races r ON r.race_id = re.race_id
JOIN drivers d ON d.driver_id = re.driver_id
JOIN constructors c ON c.constructor_id = re.constructor_id
WHERE r.year = 2024
  AND re.position <= 3
ORDER BY r.round, re.position;`,
      },
      {
        title: "Biggest gains from the grid",
        note: "Positive positions_gained means the driver finished ahead of their start",
        sql: `SELECT r.year,
       r.name AS grand_prix,
       d.forename || ' ' || d.surname AS driver,
       re.grid AS started,
       re.position AS finished,
       re.grid - re.position AS positions_gained
FROM results re
JOIN races r ON r.race_id = re.race_id
JOIN drivers d ON d.driver_id = re.driver_id
WHERE re.position IS NOT NULL
  AND re.grid > 0
ORDER BY positions_gained DESC, r.year DESC
LIMIT 30;`,
      },
      {
        title: "Qualifying versus race result",
        note: "Averages exclude classifications that have no numeric position",
        sql: `SELECT c.name AS constructor,
       COUNT(*) AS starts,
       ROUND(AVG(q.position), 2) AS avg_qualifying_position,
       ROUND(AVG(re.position), 2) AS avg_finish_position
FROM qualifying q
JOIN results re
  ON re.race_id = q.race_id
 AND re.driver_id = q.driver_id
JOIN races r ON r.race_id = re.race_id
JOIN constructors c ON c.constructor_id = re.constructor_id
WHERE r.year = 2024
  AND q.position IS NOT NULL
  AND re.position IS NOT NULL
GROUP BY c.name
ORDER BY avg_finish_position, constructor;`,
      },
    ],
  },
  {
    group: "Strategy and pace",
    blurb: "Use the event tables for pit-stop and lap-level analysis.",
    items: [
      {
        title: "Fastest 2024 pit-stop averages",
        note: "Pit stops are measured in milliseconds, not their display duration",
        sql: `SELECT c.name AS constructor,
       COUNT(*) AS pit_stops,
       ROUND(AVG(ps.milliseconds) / 1000.0, 3) AS avg_stop_seconds,
       ROUND(MIN(ps.milliseconds) / 1000.0, 3) AS fastest_stop_seconds
FROM pit_stops ps
JOIN results re
  ON re.race_id = ps.race_id
 AND re.driver_id = ps.driver_id
JOIN races r ON r.race_id = ps.race_id
JOIN constructors c ON c.constructor_id = re.constructor_id
WHERE r.year = 2024
  AND ps.milliseconds IS NOT NULL
GROUP BY c.name
HAVING COUNT(*) >= 10
ORDER BY avg_stop_seconds, constructor;`,
      },
      {
        title: "Fastest recorded laps in 2024",
        note: "Lap times are stored in milliseconds for reliable ordering",
        sql: `SELECT r.name AS grand_prix,
       d.forename || ' ' || d.surname AS driver,
       lt.lap,
       lt.time AS lap_time,
       ROUND(lt.milliseconds / 1000.0, 3) AS seconds
FROM lap_times lt
JOIN races r ON r.race_id = lt.race_id
JOIN drivers d ON d.driver_id = lt.driver_id
WHERE r.year = 2024
  AND lt.milliseconds IS NOT NULL
ORDER BY lt.milliseconds
LIMIT 30;`,
      },
      {
        title: "The drivers who stopped most often",
        note: "Count events by driver across the full archive",
        sql: `SELECT d.forename || ' ' || d.surname AS driver,
       COUNT(*) AS pit_stops,
       MIN(r.year) AS first_season,
       MAX(r.year) AS last_season
FROM pit_stops ps
JOIN drivers d ON d.driver_id = ps.driver_id
JOIN races r ON r.race_id = ps.race_id
GROUP BY d.driver_id, d.forename, d.surname
ORDER BY pit_stops DESC, driver
LIMIT 30;`,
      },
    ],
  },
  {
    group: "Plan-watching",
    blurb: "Larger joins and windows make the plan and clause trace useful.",
    items: [
      {
        title: "Constructor points by season",
        note: "Aggregate 26,000 race results, then rank each season",
        sql: `WITH constructor_seasons AS (
  SELECT r.year,
         c.name AS constructor,
         SUM(re.points) AS points
  FROM results re
  JOIN races r ON r.race_id = re.race_id
  JOIN constructors c ON c.constructor_id = re.constructor_id
  WHERE r.year >= 2014
  GROUP BY r.year, c.name
)
SELECT year,
       constructor,
       points,
       RANK() OVER (PARTITION BY year ORDER BY points DESC) AS championship_rank
FROM constructor_seasons
ORDER BY year DESC, championship_rank, constructor;`,
      },
      {
        title: "A driver's season-by-season points",
        note: "Open the Plan tab to inspect the join and aggregation",
        sql: `SELECT r.year,
       d.forename || ' ' || d.surname AS driver,
       COUNT(*) AS race_entries,
       ROUND(SUM(re.points), 1) AS points,
       SUM(CASE WHEN re.position = 1 THEN 1 ELSE 0 END) AS wins
FROM results re
JOIN races r ON r.race_id = re.race_id
JOIN drivers d ON d.driver_id = re.driver_id
WHERE r.year >= 2014
GROUP BY r.year, d.driver_id, d.forename, d.surname
HAVING SUM(re.points) > 0
ORDER BY r.year DESC, points DESC
LIMIT 100;`,
      },
    ],
  },
];
