import type { LessonContent, FoundationTopicMeta } from "./foundations-content";
import concatSubstringImg from "@/images/sql/string-functions/concat-substring-cycle-depot.png";
import leftRightLengthImg from "@/images/sql/string-functions/left-right-length-cycle-depot.png";
import upperLowerImg from "@/images/sql/string-functions/upper-lower-cycle-depot.png";
import trimReplaceImg from "@/images/sql/string-functions/trim-replace-cycle-depot.png";
import positionSplitPartImg from "@/images/sql/string-functions/position-split-part-cycle-depot.png";
import regexImg from "@/images/sql/string-functions/regex-cycle-depot.png";
import nullifCoalesceImg from "@/images/sql/string-functions/nullif-coalesce-safe-math-cycle-depot.png";
import roundTruncCeilFloorImg from "@/images/sql/numeric-functions/round-trunc-ceil-floor-cycle-depot.png";
import absSignLeastGreatestImg from "@/images/sql/numeric-functions/abs-sign-least-greatest-cycle-depot.png";
import modRemainderImg from "@/images/sql/numeric-functions/mod-remainder-cycle-depot.png";
import powerSqrtLogImg from "@/images/sql/numeric-functions/power-sqrt-log-cycle-depot.png";
import randomRangeImg from "@/images/sql/numeric-functions/random-range-cycle-depot.png";
import castToCharImg from "@/images/sql/conversions/cast-to-char-cycle-depot.png";
import convertDialectBridgeImg from "@/images/sql/conversions/convert-dialect-bridge-cycle-depot.png";
import implicitCoercionImg from "@/images/sql/conversions/implicit-coercion-cycle-depot.png";
import safeCastsImg from "@/images/sql/conversions/safe-casts-cycle-depot.png";

// =============================================================
// STRING FUNCTIONS
// =============================================================
const concatSubstring: LessonContent = {
  slug: "concat-substring",
  title: "CONCAT / CONCAT_WS / SUBSTRING: Build and Extract Text",
  subtitle:
    "Join Cycle Depot text into useful labels with or without a shared separator, then pull out the exact characters you need.",
  sections: [
    {
      kind: "prose",
      heading: "Turn stored text into a useful result",
      body: [
        "Text columns often contain the pieces of a label rather than the label itself. A customer name and email can become one contact card; a long product name can become a short catalog prefix.",
        "`CONCAT` joins text values into one new string. `CONCAT_WS` joins values with one shared separator. `SUBSTRING` copies a consecutive portion of a string. All three shape the query result only; they do not edit the stored customer or product data.",
      ],
    },
    {
      kind: "image",
      src: concatSubstringImg,
      alt: "A Cycle Depot customer record visual showing two text values merging into a contact card and a highlighted slice being extracted from text.",
      caption:
        "CONCAT and CONCAT_WS join text pieces into one value. SUBSTRING copies a selected consecutive piece of text.",
    },
    {
      kind: "prose",
      heading: "Build one contact label with CONCAT",
      body: [
        "Pass the pieces to `CONCAT` in the order you want them displayed. Literal text such as a space, angle brackets, or a separator is also an argument. `AS contact_card` gives the computed result column a useful name.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Turn Cycle Depot customer fields into a contact card",
      code: `SELECT
  name,
  email,
  CONCAT(name, ' <', email, '>') AS contact_card
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "First four customers in the current Cycle Depot dataset",
      headers: ["name", "email", "contact_card"],
      rows: [
        ["Zane Novak", "zane.novak1@example.com", "Zane Novak <zane.novak1@example.com>"],
        [
          "Boris Alvarez",
          "boris.alvarez2@example.com",
          "Boris Alvarez <boris.alvarez2@example.com>",
        ],
        ["Priya Doyle", "priya.doyle3@example.com", "Priya Doyle <priya.doyle3@example.com>"],
        ["Ugo Mensah", "ugo.mensah4@example.com", "Ugo Mensah <ugo.mensah4@example.com>"],
      ],
    },
    {
      kind: "prose",
      heading: "Use CONCAT_WS when every value shares one separator",
      body: [
        "CONCAT_WS(separator, value1, value2, ...) means concatenate with separator. Put the separator first, then list the values. It adds that separator only between non-NULL inputs, so it is clearer than repeating the same separator between every customer field.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Build one customer label with a shared separator",
      code: "SELECT\n  name,\n  country,\n  segment,\n  CONCAT_WS(' - ', name, country, segment) AS customer_label\nFROM customers\nORDER BY id\nLIMIT 4;",
    },
    {
      kind: "table",
      caption: "One separator joins each set of real Cycle Depot customer values",
      headers: ["name", "country", "segment", "customer_label"],
      rows: [
        ["Zane Novak", "USA", "pro", "Zane Novak - USA - pro"],
        ["Boris Alvarez", "UK", "retail", "Boris Alvarez - UK - retail"],
        ["Priya Doyle", "UK", "retail", "Priya Doyle - UK - retail"],
        ["Ugo Mensah", "USA", "retail", "Ugo Mensah - USA - retail"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "NULL is skipped; an empty string is still a value",
      body: "CONCAT_WS(' - ', 'Zane Novak', NULL, 'pro') returns Zane Novak - pro. An empty string is not NULL, so clean or convert blank text first when you do not want an extra separator.",
    },
    {
      kind: "animation",
      variant: "q-concat-substring",
      caption:
        "CONCAT joins explicit pieces, CONCAT_WS inserts one shared separator, and SUBSTRING returns a fixed character slice.",
    },
    {
      kind: "prose",
      heading: "Take a fixed slice with SUBSTRING",
      body: [
        "`SUBSTRING(text FROM start FOR length)` begins counting at 1, not 0. It returns `length` consecutive characters. Here, every product keeps its stored name, while `name_prefix` supplies the first five characters for a compact catalog label.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Extract the first five characters from each product name",
      code: `SELECT
  name,
  SUBSTRING(name FROM 1 FOR 5) AS name_prefix
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The same starting position and length are applied to every row",
      headers: ["name", "name_prefix"],
      rows: [
        ["Trailhead 29 Hardtail", "Trail"],
        ["Trailhead 29 Carbon", "Trail"],
        ["Boulder Full Suspension", "Bould"],
        ["Switchback Enduro", "Switc"],
      ],
    },
    {
      kind: "prose",
      heading: "Use the result of one function inside another",
      body: [
        "Functions can be nested. SQL evaluates the inner `SUBSTRING` first, then passes its short result into `CONCAT`. This creates a new value for each row without changing the original name or country.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Build a short customer label from an extracted initial",
      code: `SELECT
  name,
  country,
  CONCAT(SUBSTRING(name FROM 1 FOR 1), '. customer in ', country) AS short_label
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The inner slice becomes one input to CONCAT",
      headers: ["name", "country", "short_label"],
      rows: [
        ["Zane Novak", "USA", "Z. customer in USA"],
        ["Boris Alvarez", "UK", "B. customer in UK"],
        ["Priya Doyle", "UK", "P. customer in UK"],
        ["Ugo Mensah", "USA", "U. customer in USA"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Know what a fixed slice means",
      body: "SUBSTRING(name FROM 1 FOR 5) always takes five characters. It does not know where a word ends. Use a delimiter-aware function in a later lesson when you need to split text at a separator.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Missing text needs a deliberate choice",
      body: "In PostgreSQL, CONCAT treats a NULL argument as an empty string, CONCAT_WS skips NULL arguments and their separator, while the || operator returns NULL if either side is NULL. Decide whether a blank or a missing label better represents the report before you build it.",
    },
    {
      kind: "playground-practice",
      title: "Build compact product labels",
      prompt:
        "Return name, category, and compact_label from products. Use SUBSTRING(name FROM 1 FOR 5) for the prefix, then use CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) to add the shared separator. Name the result compact_label, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck: "30 rows with exactly name, category, and compact_label, ordered by id.",
      href: "/sql-playground?practice=cycledepot-compact-product-labels",
    },
    {
      kind: "takeaways",
      items: [
        "CONCAT joins values and literal separators into one text result.",
        "CONCAT_WS puts one shared separator between non-NULL values, so it is ideal for labels with several optional parts.",
        "SUBSTRING uses 1-based positions and returns the number of characters requested.",
        "Nested functions are evaluated from the inside out, letting a substring become an input to CONCAT.",
        "These expressions change the query output, not the stored table data.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "concat-purpose",
          question: "What does CONCAT(name, ' <', email, '>') create for each customer row?",
          options: [
            "A new stored customer record",
            "One text value built from the name, email, and separators",
            "A filter that removes customers without an email",
            "A numeric count of email addresses",
          ],
          correctIndex: 1,
          explanation:
            "CONCAT returns one text expression for the current row. It does not modify or filter the table.",
        },
        {
          id: "substring-start",
          question: "What is returned by SUBSTRING('Trailhead' FROM 1 FOR 5)?",
          options: ["railh", "Trail", "Trailhead", "head"],
          correctIndex: 1,
          explanation:
            "SUBSTRING positions start at 1, so it copies the first five characters: Trail.",
        },
        {
          id: "substring-fixed-length",
          question: "Why can SUBSTRING(name FROM 1 FOR 5) split a word partway through?",
          options: [
            "It always takes a fixed number of characters",
            "It only works with product names",
            "It removes spaces before reading",
            "It searches for the next word boundary",
          ],
          correctIndex: 0,
          explanation:
            "A fixed substring counts characters. It does not interpret words or separators.",
        },
        {
          id: "nested-order",
          question:
            "In CONCAT(SUBSTRING(name FROM 1 FOR 1), '. customer'), which operation happens first?",
          options: ["CONCAT", "ORDER BY", "SUBSTRING", "AS"],
          correctIndex: 2,
          explanation:
            "SQL evaluates the nested SUBSTRING first, then passes that one-character result to CONCAT.",
        },
        {
          id: "concat-ws-purpose",
          question: "What does CONCAT_WS(' - ', name, country, segment) do?",
          options: [
            "Joins the values with - between non-NULL values",
            "Finds - inside each value",
            "Removes spaces from every value",
            "Filters out rows with NULL values",
          ],
          correctIndex: 0,
          explanation:
            "CONCAT_WS means concatenate with separator. Its first argument is the separator, and it skips NULL value arguments rather than filtering rows.",
        },
      ],
    },
  ],
};

const leftRightLength: LessonContent = {
  slug: "left-right-length",
  title: "LEFT / RIGHT / LENGTH / CHAR_LENGTH: Inspect Text",
  subtitle:
    "Take a fixed piece from either end of Cycle Depot text, then count every character with clear, portable SQL.",
  sections: [
    {
      kind: "prose",
      heading: "Inspect text without changing it",
      body: [
        "Customer names and email addresses are stored as complete strings, but a report sometimes needs a short code, a suffix, or a quick data-quality check. `LEFT` copies characters from the beginning of a string. `RIGHT` copies characters from its end. `LENGTH` and `CHAR_LENGTH` count the characters in a text string.",
        "These functions create values in the query result. They do not shorten, replace, or otherwise edit the values stored in the `customers` table.",
      ],
    },
    {
      kind: "image",
      src: leftRightLengthImg,
      alt: "A visual showing the beginning of Zane Novak extracted as Zan, the end of an email extracted as example.com, and the ten characters in Zane Novak including the space.",
      caption:
        "LEFT reads from the beginning, RIGHT reads from the ending, and LENGTH or CHAR_LENGTH counts every character, including spaces.",
    },
    {
      kind: "prose",
      heading: "Build a small customer code with LEFT",
      body: [
        "`LEFT(text, count)` returns the requested number of characters from the beginning. A fixed count is useful for a compact code, but it counts characters rather than words. `LEFT(name, 3)` turns `Zane Novak` into `Zan`.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep the full name and add a three-character customer code",
      code: `SELECT
  name,
  LEFT(name, 3) AS name_code
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The same three-character rule is applied to each Cycle Depot customer",
      headers: ["name", "name_code"],
      rows: [
        ["Zane Novak", "Zan"],
        ["Boris Alvarez", "Bor"],
        ["Priya Doyle", "Pri"],
        ["Ugo Mensah", "Ugo"],
      ],
    },
    {
      kind: "animation",
      variant: "q-left-right-length",
      caption:
        "The stored text stays intact. LEFT and RIGHT take fixed slices, while LENGTH and CHAR_LENGTH count the same text characters.",
    },
    {
      kind: "prose",
      heading: "Read a known suffix with RIGHT",
      body: [
        "`RIGHT(text, count)` works from the other end. Every current Cycle Depot practice email ends in `example.com`, which is 11 characters long, so `RIGHT(email, 11)` returns that suffix. This is a fixed-width slice, not a general email parser. A later lesson covers delimiter-aware text splitting.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Read the last 11 characters from each practice email",
      code: `SELECT
  email,
  RIGHT(email, 11) AS email_domain
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The fixed suffix is the same in the current practice dataset",
      headers: ["email", "email_domain"],
      rows: [
        ["zane.novak1@example.com", "example.com"],
        ["boris.alvarez2@example.com", "example.com"],
        ["priya.doyle3@example.com", "example.com"],
        ["ugo.mensah4@example.com", "example.com"],
      ],
    },
    {
      kind: "prose",
      heading: "Use LENGTH to inspect character counts",
      body: [
        "`LENGTH(text)` returns a number. It counts letters, digits, punctuation, and spaces. `LENGTH('Zane Novak')` is 10 because the blank space between the two names is also a character.",
        "Character counts can help spot unexpectedly short or long values. They are not a substitute for a format rule, but they are a quick first signal when exploring a dataset.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption:
        "Inspect the full customer name, a short code, an email suffix, and the character count together",
      code: `SELECT
  name,
  LEFT(name, 3) AS name_code,
  RIGHT(email, 11) AS email_domain,
  LENGTH(name) AS name_characters
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "A text expression can sit beside the original values in one result",
      headers: ["name", "name_code", "email_domain", "name_characters"],
      rows: [
        ["Zane Novak", "Zan", "example.com", "10"],
        ["Boris Alvarez", "Bor", "example.com", "13"],
        ["Priya Doyle", "Pri", "example.com", "11"],
        ["Ugo Mensah", "Ugo", "example.com", "10"],
      ],
    },
    {
      kind: "prose",
      heading: "Use CHAR_LENGTH when you want to say characters",
      body: [
        "For text values in PostgreSQL and DuckDB, `CHAR_LENGTH(text)` and `LENGTH(text)` return the same character count. `CHAR_LENGTH` is the clearer spelling when the unit matters, such as a validation rule that limits a customer name to a number of characters.",
        "Do not confuse character count with storage size. A non-ASCII character can occupy more than one byte, but both functions below count it as one character in text.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Compare the two character-count expressions on the same Cycle Depot names",
      code: `SELECT
  name,
  LENGTH(name) AS length_count,
  CHAR_LENGTH(name) AS character_count
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "For text, both functions count the same characters, including spaces",
      headers: ["name", "length_count", "character_count"],
      rows: [
        ["Zane Novak", "10", "10"],
        ["Boris Alvarez", "13", "13"],
        ["Priya Doyle", "11", "11"],
        ["Ugo Mensah", "10", "10"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Fixed width means fixed width",
      body: "If the requested count is longer than the available text, LEFT and RIGHT return the whole string. They do not pad it or raise an error. Use a delimiter-aware function when the part you need can have a variable length.",
    },
    {
      kind: "playground-practice",
      title: "Create customer text summaries",
      prompt:
        "Return name, name_code, email_domain, and name_characters from customers. Use LEFT(name, 3), RIGHT(email, 11), and CHAR_LENGTH(name). Name the calculated columns exactly, order by id, and run the checked exercise.",
      tables: ["customers"],
      successCheck:
        "60 rows with exactly name, name_code, email_domain, and name_characters, ordered by id.",
      href: "/sql-playground?practice=cycledepot-customer-text-summaries",
    },
    {
      kind: "takeaways",
      items: [
        "LEFT takes a fixed number of characters from the beginning of a text value.",
        "RIGHT takes a fixed number of characters from the end of a text value.",
        "LENGTH and CHAR_LENGTH both count every character in a text value, including spaces and punctuation.",
        "CHAR_LENGTH makes the character unit explicit, which helps when writing portable text-validation rules.",
        "These functions transform the result of a query, not the text stored in the source table.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "left-direction",
          question: "What does LEFT('Zane Novak', 3) return?",
          options: ["Nov", "Zan", "Zane", "10"],
          correctIndex: 1,
          explanation:
            "LEFT starts at the beginning and returns the requested three characters: Zan.",
        },
        {
          id: "right-direction",
          question: "What does RIGHT('example.com', 3) return?",
          options: ["exa", "com", "moc", "example.com"],
          correctIndex: 1,
          explanation:
            "RIGHT counts from the end of the string, so the last three characters are com.",
        },
        {
          id: "length-space",
          question: "Why is LENGTH('Zane Novak') equal to 10?",
          options: [
            "It counts the space between the names",
            "It ignores all spaces",
            "It counts only vowels",
            "It rounds the name to ten characters",
          ],
          correctIndex: 0,
          explanation:
            "LENGTH counts all characters in the string, including the space between Zane and Novak.",
        },
        {
          id: "long-request",
          question:
            "What happens when LEFT('Bike', 10) asks for more characters than the string contains?",
          options: [
            "It returns Bike",
            "It adds spaces until there are ten characters",
            "It raises an error",
            "It returns an empty value",
          ],
          correctIndex: 0,
          explanation:
            "LEFT returns the available text when the requested count exceeds the string length.",
        },
        {
          id: "char-length-text",
          question: "For a text column, what does CHAR_LENGTH(name) count?",
          options: [
            "Characters, including spaces",
            "Only letters",
            "Bytes used in storage",
            "Words separated by spaces",
          ],
          correctIndex: 0,
          explanation:
            "CHAR_LENGTH counts characters in text. For the Cycle Depot names, it returns the same values as LENGTH.",
        },
      ],
    },
  ],
};

const upperLower: LessonContent = {
  slug: "upper-lower",
  title: "UPPER / LOWER / INITCAP: Standardize Text",
  subtitle:
    "Choose uppercase, lowercase, or title case for Cycle Depot query results without editing stored values.",
  sections: [
    {
      kind: "prose",
      heading: "Choose the case your result needs",
      body: [
        "The same stored text can need different presentation in different outputs. A product name may need an uppercase catalog label, a lowercase export value, or a title-cased heading.",
        "`UPPER` converts letters to uppercase. `LOWER` converts letters to lowercase. `INITCAP` makes the first letter of each word uppercase and the remaining letters lowercase. All three return a new text value for each row, so the original `name` or `category` remains available exactly as stored.",
      ],
    },
    {
      kind: "image",
      src: upperLowerImg,
      alt: "The Cycle Depot product name GPS Cycling Computer stays stored unchanged while UPPER, LOWER, and INITCAP of its lowercase form create differently cased query results.",
      caption:
        "UPPER, LOWER, and INITCAP format a query result only. Notice that title casing turns the GPS acronym into Gps, so use it when that convention is appropriate.",
    },
    {
      kind: "prose",
      heading: "Create an uppercase catalog label",
      body: [
        "`UPPER(text)` changes every letter in its input to uppercase. Numbers, spaces, and punctuation remain in place. Give the computed expression an alias so the result is easy to understand when it leaves the query.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep each product name and add an uppercase display label",
      code: `SELECT
  name,
  UPPER(name) AS name_upper
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "UPPER changes letters but preserves the rest of each product name",
      headers: ["name", "name_upper"],
      rows: [
        ["Trailhead 29 Hardtail", "TRAILHEAD 29 HARDTAIL"],
        ["Trailhead 29 Carbon", "TRAILHEAD 29 CARBON"],
        ["Boulder Full Suspension", "BOULDER FULL SUSPENSION"],
        ["Switchback Enduro", "SWITCHBACK ENDURO"],
      ],
    },
    {
      kind: "animation",
      variant: "q-upper-lower",
      caption:
        "The source text remains visible. UPPER, LOWER, and INITCAP each add a formatted value beside it for the same product row.",
    },
    {
      kind: "prose",
      heading: "Create a lowercase export value",
      body: [
        "`LOWER(text)` does the opposite: it turns letters into lowercase while keeping spaces and punctuation. Here it creates a predictable lowercase version of each product category without overwriting the title-cased category in `products`.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep the original category and add a lowercase version",
      code: `SELECT
  category,
  LOWER(category) AS category_lower
FROM products
ORDER BY id
LIMIT 6;`,
    },
    {
      kind: "table",
      caption: "The first six products contain two stored categories, each with a lowercase result",
      headers: ["category", "category_lower"],
      rows: [
        ["Mountain Bikes", "mountain bikes"],
        ["Mountain Bikes", "mountain bikes"],
        ["Mountain Bikes", "mountain bikes"],
        ["Mountain Bikes", "mountain bikes"],
        ["Road Bikes", "road bikes"],
        ["Road Bikes", "road bikes"],
      ],
    },
    {
      kind: "prose",
      heading: "Use INITCAP for a title-cased result",
      body: [
        "`INITCAP(text)` title-cases every alphanumeric word. It is useful when incoming labels arrive in inconsistent case and a report needs a readable title style. Applying it after `LOWER` makes the intended normalization explicit.",
        "Title case is mechanical, not editorial. `INITCAP(LOWER('GPS Cycling Computer'))` returns `Gps Cycling Computer`, so preserve an acronym when its exact capitalization matters.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Create a title-cased product label from normalized text",
      code: `SELECT
  name,
  INITCAP(LOWER(name)) AS name_title
FROM products
WHERE name = 'GPS Cycling Computer';`,
    },
    {
      kind: "table",
      caption:
        "INITCAP title-cases each word. Acronyms such as GPS become Gps after the lower-and-title-case transformation.",
      headers: ["name", "name_title"],
      rows: [["GPS Cycling Computer", "Gps Cycling Computer"]],
    },
    {
      kind: "callout",
      tone: "info",
      title: "INITCAP is a PostgreSQL lesson function",
      body: "The checked exercise runs on PostgreSQL because the Playground's DuckDB engine does not provide INITCAP. The earlier UPPER and LOWER examples work in both engines.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Missing text stays missing",
      body: "UPPER(NULL), LOWER(NULL), and INITCAP(NULL) return NULL. The functions transform available text; they do not fill in a missing value. A later NULL-handling lesson covers choosing a fallback label deliberately.",
    },
    {
      kind: "playground-practice",
      title: "Create product case labels",
      prompt:
        "Return name, category, category_upper, category_lower, and name_title from products. Use UPPER(category), LOWER(category), and INITCAP(LOWER(name)), name the calculated columns exactly, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly name, category, category_upper, category_lower, and name_title, ordered by id.",
      href: "/sql-playground?practice=cycledepot-product-case-labels",
    },
    {
      kind: "takeaways",
      items: [
        "UPPER converts letters in a text expression to uppercase.",
        "LOWER converts letters in a text expression to lowercase.",
        "INITCAP title-cases words, but it can change acronyms such as GPS to Gps.",
        "All three functions format the query result without editing the stored source value.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "upper-result",
          question: "What does UPPER('Road Bikes') return?",
          options: ["road bikes", "ROAD BIKES", "Road Bikes", "NULL"],
          correctIndex: 1,
          explanation:
            "UPPER changes the letters in its input to uppercase while preserving the space.",
        },
        {
          id: "lower-result",
          question: "What does LOWER('GPS Cycling Computer') return?",
          options: [
            "gps cycling computer",
            "GPS CYCLING COMPUTER",
            "Gps Cycling Computer",
            "GPScyclingcomputer",
          ],
          correctIndex: 0,
          explanation: "LOWER changes letters to lowercase and leaves the spaces in place.",
        },
        {
          id: "initcap-result",
          question: "What does INITCAP(LOWER('GPS Cycling Computer')) return?",
          options: [
            "GPS Cycling Computer",
            "gps cycling computer",
            "Gps Cycling Computer",
            "Gps cycling computer",
          ],
          correctIndex: 2,
          explanation:
            "LOWER first makes every letter lowercase, then INITCAP makes the first letter of each word uppercase. It does not preserve the GPS acronym.",
        },
        {
          id: "case-source",
          question: "What happens to the stored category when a SELECT query uses LOWER(category)?",
          options: [
            "It stays unchanged",
            "It is permanently lowercased",
            "It is deleted after the query",
            "It is sorted alphabetically",
          ],
          correctIndex: 0,
          explanation:
            "A SELECT expression creates a result value. It does not update the value stored in the table.",
        },
        {
          id: "case-null",
          question: "What does INITCAP(NULL) return?",
          options: ["An empty string", "NULL", "The word null", "A syntax error"],
          correctIndex: 1,
          explanation: "The functions transform available text. A missing text value remains NULL.",
        },
      ],
    },
  ],
};

const trimReplace: LessonContent = {
  slug: "trim-replace",
  title: "TRIM / LTRIM / RTRIM / BTRIM / REPLACE: Clean Text",
  subtitle:
    "Clean whitespace or chosen edge characters, then reshape exact text in Cycle Depot product labels.",
  sections: [
    {
      kind: "prose",
      heading: "Clean text before you rely on it",
      body: [
        "Text often needs a small cleanup before it becomes a label, export field, or product key. `LTRIM` removes spaces from the beginning, `RTRIM` removes spaces from the end, and `TRIM` removes spaces from both edges. `BTRIM` removes chosen characters from both edges. `REPLACE` swaps every exact occurrence of one piece of text for another.",
        "These functions return cleaned values in the query result. The original product name remains stored exactly as it was, so you can choose the right cleaned form for each output without editing the table.",
      ],
    },
    {
      kind: "image",
      src: trimReplaceImg,
      alt: "Cycle Depot product cleanup visual showing LTRIM, RTRIM, TRIM, BTRIM with hyphens, and REPLACE on real product text.",
      caption:
        "The colored edge blocks make the directional difference visible: LTRIM keeps right padding, RTRIM keeps left padding, and TRIM removes both. BTRIM removes the chosen hyphens at both ends; REPLACE changes exact internal matches.",
    },
    {
      kind: "prose",
      heading: "LTRIM, RTRIM, and TRIM choose the whitespace edge to clean",
      body: [
        "The current Cycle Depot product names are already clean. To make the behavior visible, these queries add one temporary space on each side of a real product name. Pipes make the remaining spaces visible in the result: `LTRIM` leaves the right padding, `RTRIM` leaves the left padding, and `TRIM` removes both.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Remove only the left edge with LTRIM",
      code: `SELECT
  name,
  CONCAT('|', LTRIM(CONCAT(' ', name, ' ')), '|') AS left_trimmed
FROM products
WHERE id = 1;`,
    },
    {
      kind: "table",
      caption:
        "LTRIM removes the left-edge space and keeps the right-edge space before the closing pipe.",
      headers: ["name", "left_trimmed"],
      rows: [["Trailhead 29 Hardtail", "|Trailhead 29 Hardtail  |"]],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Remove only the right edge with RTRIM",
      code: `SELECT
  name,
  CONCAT('|', RTRIM(CONCAT(' ', name, ' ')), '|') AS right_trimmed
FROM products
WHERE id = 1;`,
    },
    {
      kind: "table",
      caption:
        "RTRIM keeps the left-edge space after the opening pipe and removes the right-edge space.",
      headers: ["name", "right_trimmed"],
      rows: [["Trailhead 29 Hardtail", "|  Trailhead 29 Hardtail|"]],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Remove both edges with TRIM",
      code: `SELECT
  name,
  CONCAT('|', TRIM(CONCAT(' ', name, ' ')), '|') AS fully_trimmed
FROM products
WHERE id = 1;`,
    },
    {
      kind: "table",
      caption:
        "TRIM removes both temporary edges while preserving the spaces inside the product name.",
      headers: ["name", "fully_trimmed"],
      rows: [["Trailhead 29 Hardtail", "|Trailhead 29 Hardtail|"]],
    },
    {
      kind: "prose",
      heading: "BTRIM removes characters you name",
      body: [
        "`BTRIM(text, characters)` removes any of the listed characters from both outside edges. It is useful when an imported label arrives wrapped in markers such as hyphens. Unlike `REPLACE`, it does not change matching characters in the middle of the value.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Remove imported hyphen markers from both edges with BTRIM",
      code: `SELECT
  name,
  BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed
FROM products
WHERE id = 1;`,
    },
    {
      kind: "table",
      caption:
        "BTRIM removes the outer hyphens and keeps the product name, including its internal spaces.",
      headers: ["name", "marker_trimmed"],
      rows: [["Trailhead 29 Hardtail", "Trailhead 29 Hardtail"]],
    },
    {
      kind: "animation",
      variant: "q-trim-replace",
      caption:
        "Compare the whitespace edge-cleanup choices, remove chosen hyphen markers with BTRIM, then see REPLACE change matching text inside a new result value. The original name remains available in every stage.",
    },
    {
      kind: "prose",
      heading: "REPLACE swaps every matching piece of text",
      body: [
        "`REPLACE(text, find, replacement)` looks through the text for the exact `find` value and swaps every match. Replacing each space with a hyphen makes a compact product key that is easier to carry into a filename or URL-like label.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Replace every space in a product name with a hyphen",
      code: `SELECT
  name,
  REPLACE(name, ' ', '-') AS product_key
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "Every matching space becomes a hyphen in the computed product key",
      headers: ["name", "product_key"],
      rows: [
        ["Trailhead 29 Hardtail", "Trailhead-29-Hardtail"],
        ["Trailhead 29 Carbon", "Trailhead-29-Carbon"],
        ["Boulder Full Suspension", "Boulder-Full-Suspension"],
        ["Switchback Enduro", "Switchback-Enduro"],
      ],
    },
    {
      kind: "prose",
      heading: "Clean, then reshape",
      body: [
        "Functions can be nested when one cleanup needs to happen before another. SQL evaluates the inner `TRIM` first, then gives its cleaned text to `REPLACE`. This sequence prevents accidental edge separators when a text value arrives with extra spaces.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Remove temporary edge spaces before changing the internal spaces",
      code: `SELECT
  name,
  REPLACE(TRIM(CONCAT(' ', name, ' ')), ' ', '-') AS product_key
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "REPLACE is exact",
      body: "REPLACE(name, 'road', 'bike') does not find the capital R in Road. It matches the exact characters you provide. Use a case-conversion function first when the input case needs to be standardized before a replacement.",
    },
    {
      kind: "playground-practice",
      title: "Create clean product keys",
      prompt:
        "Return name, left_trimmed, right_trimmed, marker_trimmed, and product_key from products. Add one edge space on each side for LTRIM and RTRIM, use BTRIM to remove surrounding hyphens, then use TRIM and REPLACE to create product_key. Name every calculated column exactly, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly name, left_trimmed, right_trimmed, marker_trimmed, and product_key, ordered by id.",
      href: "/sql-playground?practice=cycledepot-clean-product-keys",
    },
    {
      kind: "takeaways",
      items: [
        "TRIM removes spaces from the beginning and end of a text value, not its middle.",
        "LTRIM removes only the left edge, while RTRIM removes only the right edge.",
        "BTRIM removes the characters you specify from both edges, while leaving matching middle characters alone.",
        "REPLACE changes every exact match of the text you specify.",
        "Nested text functions run from the inside out, so TRIM can clean text before REPLACE reshapes it.",
        "These functions create a cleaned result without modifying the stored source value.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "trim-edges",
          question: "What does TRIM('  Road Bikes  ') return?",
          options: ["Road Bikes", "RoadBikes", "  Road Bikes  ", "Road-Bikes"],
          correctIndex: 0,
          explanation: "TRIM removes the edge spaces but keeps the space between Road and Bikes.",
        },
        {
          id: "rtrim-direction",
          question: "Which function removes spaces only from the right edge of a text value?",
          options: ["LTRIM", "RTRIM", "BTRIM", "REPLACE"],
          correctIndex: 1,
          explanation:
            "RTRIM means right trim. LTRIM cleans only the left edge, while TRIM cleans both edges.",
        },
        {
          id: "btrim-characters",
          question: "What does BTRIM('---Trailhead---', '-') return for the Cycle Depot label?",
          options: ["Trailhead", "---Trailhead---", "Trailhead-", "Trailhead---"],
          correctIndex: 0,
          explanation:
            "BTRIM removes the specified hyphen characters from both outside edges of the text value.",
        },
        {
          id: "btrim-query-choice",
          question:
            "Which expression removes the imported --- markers from both edges of every product name?",
          options: [
            "BTRIM(CONCAT('---', name, '---'), '-')",
            "REPLACE(name, '-', '')",
            "LTRIM(CONCAT('---', name, '---'))",
            "RTRIM(CONCAT('---', name, '---'))",
          ],
          correctIndex: 0,
          explanation:
            "BTRIM receives both the padded text and the character to trim. REPLACE would remove matching hyphens everywhere, while LTRIM and RTRIM clean only one side.",
        },
        {
          id: "replace-spaces",
          question: "What does REPLACE('Trailhead 29', ' ', '-') return?",
          options: ["Trailhead 29", "Trailhead-29", "Trailhead--29", "trailhead-29"],
          correctIndex: 1,
          explanation: "REPLACE swaps each matching single space with one hyphen.",
        },
        {
          id: "replace-exact-case",
          question: "Will REPLACE('Road Bikes', 'road', 'bike') change the value?",
          options: [
            "No, because the match has different letter case",
            "Yes, it returns bike Bikes",
            "Yes, it returns Road bike",
            "It returns NULL",
          ],
          correctIndex: 0,
          explanation:
            "REPLACE looks for the exact characters supplied, including their letter case.",
        },
        {
          id: "nested-cleaning-order",
          question: "In REPLACE(TRIM(text), ' ', '-'), which function runs first?",
          options: ["TRIM", "REPLACE", "ORDER BY", "AS"],
          correctIndex: 0,
          explanation:
            "The inner TRIM runs first and its cleaned output becomes the input to REPLACE.",
        },
      ],
    },
  ],
};

const positionSplitPart: LessonContent = {
  slug: "position-split-part",
  title: "POSITION / SPLIT_PART: Find and Separate Text",
  subtitle: "Locate a real delimiter in Cycle Depot emails, then return the pieces on either side.",
  sections: [
    {
      kind: "prose",
      heading: "Use a delimiter when text has a clear boundary",
      body: [
        "`LEFT` and `RIGHT` take a fixed number of characters. When a value has a dependable separator, delimiter-aware functions are easier to read. Cycle Depot customer emails use `@` to separate the local email name from its domain.",
        "`POSITION` tells you where a delimiter occurs. `SPLIT_PART` returns a numbered piece around that delimiter. Both create values in the result without changing the email stored in `customers`.",
      ],
    },
    {
      kind: "image",
      src: positionSplitPartImg,
      alt: "A Cycle Depot customer email highlights its @ delimiter, shows its position as 12, and shows SPLIT_PART returning the local email name and domain.",
      caption:
        "POSITION finds the `@` marker. SPLIT_PART uses the same marker to return the text before it or after it.",
    },
    {
      kind: "prose",
      heading: "Find a delimiter with POSITION",
      body: [
        "Write `POSITION(needle IN text)`. SQL reports the delimiter position starting at 1, not 0. For the first Cycle Depot email below, eleven characters appear before `@`, so `@` is at position 12.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find the @ position in four customer emails",
      code: `SELECT
  email,
  POSITION('@' IN email) AS at_position
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The @ position varies with the local email name",
      headers: ["email", "at_position"],
      rows: [
        ["zane.novak1@example.com", "12"],
        ["boris.alvarez2@example.com", "15"],
        ["priya.doyle3@example.com", "13"],
        ["ugo.mensah4@example.com", "12"],
      ],
    },
    {
      kind: "animation",
      variant: "q-position-split-part",
      caption:
        "First locate the @ marker. Then use it as the delimiter that divides every email into two meaningful parts.",
    },
    {
      kind: "prose",
      heading: "Split a known structure into numbered parts",
      body: [
        "`SPLIT_PART(text, delimiter, part_number)` counts pieces from left to right. Part 1 is before the first delimiter and part 2 is after it. Use part 1 for the local email name and part 2 for the domain.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Return the local email name and domain as separate columns",
      code: `SELECT
  email,
  SPLIT_PART(email, '@', 1) AS email_local,
  SPLIT_PART(email, '@', 2) AS email_domain
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "SPLIT_PART divides each current Cycle Depot email at @",
      headers: ["email", "email_local", "email_domain"],
      rows: [
        ["zane.novak1@example.com", "zane.novak1", "example.com"],
        ["boris.alvarez2@example.com", "boris.alvarez2", "example.com"],
        ["priya.doyle3@example.com", "priya.doyle3", "example.com"],
        ["ugo.mensah4@example.com", "ugo.mensah4", "example.com"],
      ],
    },
    {
      kind: "prose",
      heading: "The same idea works with a name separator",
      body: [
        "Customer names in this dataset have a dependable space between first and last name. The delimiter changes, but the rule stays the same: part 1 is before the first separator and part 2 is after it.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Split the first four customer names at their space",
      code: `SELECT
  name,
  SPLIT_PART(name, ' ', 1) AS first_name,
  SPLIT_PART(name, ' ', 2) AS last_name
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Use SPLIT_PART for a known, simple format",
      body: "SPLIT_PART treats the delimiter exactly as you write it. Check the shape of the source values first, then use it when the separator and the piece you need are clear. More variable text formats belong in the later regular-expression lesson.",
    },
    {
      kind: "playground-practice",
      title: "Extract customer email parts",
      prompt:
        "Return email, at_position, email_local, and email_domain from customers. Use POSITION('@' IN email), SPLIT_PART(email, '@', 1), and SPLIT_PART(email, '@', 2). Name the columns exactly, order by id, and run the checked exercise.",
      tables: ["customers"],
      successCheck:
        "60 rows with exactly email, at_position, email_local, and email_domain, ordered by id.",
      href: "/sql-playground?practice=cycledepot-customer-email-parts",
    },
    {
      kind: "takeaways",
      items: [
        "POSITION reports where text first appears, using positions that start at 1.",
        "SPLIT_PART(text, delimiter, 1) returns the first piece, and part 2 returns the next piece.",
        "A known delimiter makes text extraction clearer than relying on a fixed character count.",
        "These functions shape values in a SELECT result and leave the stored source text unchanged.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "position-one-based",
          question:
            "If eleven characters come before @ in an email, what does POSITION('@' IN email) return?",
          options: ["12", "11", "0", "13"],
          correctIndex: 0,
          explanation:
            "POSITION starts counting at 1, so the next character after eleven characters is position 12.",
        },
        {
          id: "split-part-first",
          question: "What does SPLIT_PART('zane.novak1@example.com', '@', 1) return?",
          options: ["zane.novak1", "example.com", "@", "zane.novak1@example.com"],
          correctIndex: 0,
          explanation: "Part 1 is the text before the first @ delimiter.",
        },
        {
          id: "split-part-second",
          question: "Which expression returns example.com from zane.novak1@example.com?",
          options: [
            "SPLIT_PART(email, '@', 2)",
            "SPLIT_PART(email, '@', 1)",
            "POSITION('@' IN email)",
            "LEFT(email, 2)",
          ],
          correctIndex: 0,
          explanation: "The domain is the second piece around the @ delimiter.",
        },
        {
          id: "delimiter-use",
          question: "When is SPLIT_PART a good fit?",
          options: [
            "When text has a known, simple separator",
            "When a table needs rows removed",
            "When every value has an unrelated format",
            "When numbers need to be added",
          ],
          correctIndex: 0,
          explanation: "SPLIT_PART is clearest when the delimiter and the part you need are known.",
        },
      ],
    },
  ],
};

const regex: LessonContent = {
  slug: "regex",
  title: "Regular Expressions: Flexible Pattern Matching",
  subtitle:
    "Find, extract, and reshape text when a fixed delimiter or character count is not enough.",
  sections: [
    {
      kind: "prose",
      heading: "Use regex when the shape matters more than the exact text",
      body: [
        "The earlier string functions work best when you know an exact character count or a reliable separator. Regular expressions, usually called regex, describe a text pattern instead. They are useful when a product name might contain any number, any letter, or a structured prefix.",
        "This lesson uses PostgreSQL regex syntax in the Cycle Depot playground. The `~` operator keeps rows whose text matches a pattern. A regex can also extract or replace the matching part while leaving the stored source value unchanged.",
      ],
    },
    {
      kind: "image",
      src: regexImg,
      alt: "The number 29 is highlighted in the Cycle Depot product name Trailhead 29 Hardtail. The regular expression [0-9]+ matches it, while Boulder Full Suspension has no digits.",
      caption:
        "`[0-9]+` means one or more digits. It matches the model number in Trailhead 29 Hardtail without needing to know that the number is 29.",
    },
    {
      kind: "prose",
      heading: "Start with one useful pattern",
      body: [
        "In PostgreSQL, `name ~ pattern` asks whether the text matches the pattern anywhere. `[0-9]` means one digit from 0 through 9, and `+` means one or more of the preceding item. Together, `[0-9]+` finds a run of digits.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find Cycle Depot product names that contain a number",
      code: `SELECT name
FROM products
WHERE name ~ '[0-9]+'
ORDER BY id
LIMIT 5;`,
    },
    {
      kind: "table",
      caption: "The first five matching product names in the current Cycle Depot dataset",
      headers: ["name"],
      rows: [
        ["Trailhead 29 Hardtail"],
        ["Trailhead 29 Carbon"],
        ["City Commuter 7"],
        ["11-Speed Cassette"],
        ["1200lm Front Light"],
      ],
    },
    {
      kind: "animation",
      variant: "q-regex",
      caption:
        "The pattern is tested against each product name. A match can keep a row, extract the matching characters, or reshape them into a new value.",
    },
    {
      kind: "prose",
      heading: "Learn the function names as well as the operator",
      body: [
        "PostgreSQL supports both the compact `~` operator and the explicit `REGEXP_LIKE` function for filtering. It also supports `REGEXP_SUBSTR` for extracting the first match. The function forms are especially useful to recognise because several other SQL systems use the same names.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Filter and extract the first model-number match with PostgreSQL regex functions",
      code: `SELECT
  name,
  REGEXP_SUBSTR(name, '[0-9]+') AS model_number
FROM products
WHERE REGEXP_LIKE(name, '[0-9]+')
ORDER BY id
LIMIT 5;`,
    },
    {
      kind: "table",
      caption: "Five real Cycle Depot products whose names contain a model-number run",
      headers: ["name", "model_number"],
      rows: [
        ["Trailhead 29 Hardtail", "29"],
        ["Trailhead 29 Carbon", "29"],
        ["City Commuter 7", "7"],
        ["11-Speed Cassette", "11"],
        ["1200lm Front Light", "1200"],
      ],
    },
    {
      kind: "table",
      caption: "Interview dialect map: the pattern stays familiar while the SQL wrapper changes",
      headers: ["SQL dialect", "test whether text matches", "extract a match"],
      rows: [
        [
          "PostgreSQL",
          "name ~ '[0-9]+' or REGEXP_LIKE(name, '[0-9]+')",
          "REGEXP_SUBSTR(name, '[0-9]+')",
        ],
        [
          "MySQL, Oracle, Snowflake",
          "REGEXP_LIKE(name, '[0-9]+')",
          "REGEXP_SUBSTR(name, '[0-9]+')",
        ],
        ["Spark SQL, Hive", "name RLIKE '[0-9]+'", "regexp_extract(name, '[0-9]+', 0)"],
        ["BigQuery", "REGEXP_CONTAINS(name, r'[0-9]+')", "REGEXP_EXTRACT(name, r'[0-9]+')"],
      ],
    },
    {
      kind: "prose",
      heading: "Build patterns from a small toolkit",
      body: [
        "Strong regex work is usually a matter of combining a few readable building blocks. Start with the narrowest description of the text you actually expect, then anchor it when the whole value must have that shape. The examples below use PostgreSQL advanced regular expressions.",
      ],
    },
    {
      kind: "table",
      caption: "Core PostgreSQL regex building blocks",
      headers: ["pattern", "meaning", "Cycle Depot use"],
      rows: [
        ["Volt", "literal text", "matches the exact letters Volt"],
        [".", "any one character", "Volt.E- matches Volt E-"],
        ["[0-9] / [A-Za-z]", "one digit / one letter", "matches 2 or T"],
        [
          "[[:digit:]] / [[:alpha:]]",
          "POSIX digit / letter class",
          "a readable alternative to [0-9] or [A-Za-z]",
        ],
        ["\\d / \\D", "a digit / a non-digit", "\\d+ also matches 29"],
        [
          "\\w / \\W",
          "a word character / a non-word character",
          "the hyphen in 11-Speed is non-word text",
        ],
        ["\\s / \\S", "whitespace / non-whitespace", "the space in Trailhead 29 is whitespace"],
        ["[^0-9]", "one character that is not a digit", "matches T in Trailhead"],
        ["+ / * / ?", "one or more / zero or more / optional", "[0-9]+ matches 29"],
        ["{m,n}", "between m and n repeats", "[0-9]{2}- matches 11-"],
        ["(Volt|City)", "a group with alternatives", "matches either product prefix"],
        ["^ / $", "start / end of the value", "^Volt and Bikes$"],
      ],
    },
    {
      kind: "table",
      caption:
        "Interview pattern recipes: combine the building blocks rather than memorizing one giant regex",
      headers: ["need", "pattern", "what it accepts"],
      rows: [
        ["contains a model number", "[0-9]+", "a run of one or more digits anywhere"],
        ["two-digit model at the start", "^[0-9]{2}-", "11-Speed, but not Trailhead 29"],
        ["one approved prefix", "^(Volt|City)", "names beginning with Volt or City"],
        ["only letters and spaces", "^[A-Za-z ]+$", "the entire value, not just one matching part"],
        [
          "simple email shape",
          "^[a-z]+\\.[a-z]+[0-9]+@[a-z]+\\.[a-z]+$",
          "the five expected pieces of a Cycle Depot email",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Use readable classes when portability matters",
      body: "The current PostgreSQL playground accepts shortcuts such as `\\d`, `\\w`, and `\\s`. They are convenient, but regex engines vary. `[0-9]`, `[A-Za-z]`, and POSIX classes such as `[[:digit:]]` make intent clearer when you are unsure which SQL regex engine an interviewer expects.",
    },
    {
      kind: "prose",
      heading: "Group alternatives instead of writing separate filters",
      body: [
        "Parentheses make a group, and `|` means or. Combined with `^`, this query keeps names that begin with either allowed brand prefix. The parentheses matter because they keep the alternatives together before the anchor is applied.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find products that begin with Volt or City",
      code: `SELECT name
FROM products
WHERE name ~ '^(Volt|City)'
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The four Cycle Depot product names beginning with either allowed prefix",
      headers: ["name"],
      rows: [
        ["City Commuter 7"],
        ["City Commuter Step-Thru"],
        ["Volt E-Commuter"],
        ["Volt E-Cargo"],
      ],
    },
    {
      kind: "prose",
      heading: "Use anchors when the position matters",
      body: [
        "A pattern normally matches anywhere in the text. `^` anchors it to the beginning and `$` anchors it to the end. For example, the pattern below means: start with one or more digits, followed immediately by a hyphen. It finds a product whose name starts with a model number, rather than merely containing one later.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find a product name that begins with digits followed by a hyphen",
      code: `SELECT name
FROM products
WHERE name ~ '^[0-9]+-'
ORDER BY id;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Read this pattern left to right",
      body: "`^` means the start of the text. `[0-9]` means one digit. `+` repeats that digit rule one or more times. `-` is a literal hyphen. In the current Cycle Depot products, this pattern returns 11-Speed Cassette.",
    },
    {
      kind: "prose",
      heading: "Choose case-sensitive, case-insensitive, or negative matching",
      body: [
        "`~` is case-sensitive. `~*` ignores case. Prefix either operator with `!` to keep rows that do not match: `!~` is case-sensitive and `!~*` ignores case. These variants let you state the test directly instead of lowercasing a column solely to compare it.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find Volt products regardless of the input letter case",
      code: `SELECT name
FROM products
WHERE name ~* '^volt'
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The case-insensitive prefix pattern finds both Volt products",
      headers: ["name"],
      rows: [["Volt E-Commuter"], ["Volt E-Cargo"]],
    },
    {
      kind: "prose",
      heading: "Extract or replace the matched text",
      body: [
        "A regex can do more than filter. `SUBSTRING(text FROM pattern)` returns the part that matches, such as a model number. `REGEXP_MATCH` returns the text captured by parenthesized groups as an array. `REGEXP_REPLACE` creates a reshaped result. Its final `g` flag means replace every matching occurrence, not just the first one.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Capture structured pieces of one real customer email",
      code: `SELECT
  email,
  REGEXP_MATCH(
    email,
    '^([a-z]+)\\.([a-z]+)([0-9]+)@([a-z]+)\\.([a-z]+)$'
  ) AS email_parts
FROM customers
ORDER BY id
LIMIT 1;`,
    },
    {
      kind: "table",
      caption: "REGEXP_MATCH returns the captured groups in order",
      headers: ["email", "email_parts"],
      rows: [["zane.novak1@example.com", "[zane, novak, 1, example, com]"]],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Escape a literal dot",
      body: "In a regex, `.` means any character. Write `\\.` when you mean a literal dot, as in an email address. Parentheses capture pieces, so the email pattern captures first name, last name, numeric suffix, domain name, and top-level domain separately.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Replace every run of digits in a product name with #",
      code: `SELECT
  name,
  REGEXP_REPLACE(name, '[0-9]+', '#', 'g') AS masked_name
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "REGEXP_REPLACE creates a new masked value without updating the stored product name",
      headers: ["name", "masked_name"],
      rows: [
        ["Trailhead 29 Hardtail", "Trailhead # Hardtail"],
        ["Trailhead 29 Carbon", "Trailhead # Carbon"],
        ["Boulder Full Suspension", "Boulder Full Suspension"],
        ["Switchback Enduro", "Switchback Enduro"],
      ],
    },
    {
      kind: "prose",
      heading: "Capture pieces, then reuse them in a replacement",
      body: [
        "Each parenthesized part of a pattern is a capture group. PostgreSQL numbers the groups from left to right: the first is `\\1`, the second is `\\2`, and so on. In a replacement string, those references let you rearrange the pieces that were matched.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Put the model number first without changing the stored name",
      code: `SELECT
  name,
  REGEXP_REPLACE(
    name,
    '^(.+) ([0-9]+) (.+)$',
    '\\2-\\1-\\3'
  ) AS model_first
FROM products
WHERE name ~ '^.+ [0-9]+ .+$'
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The second captured group is reused before the first and third groups",
      headers: ["name", "model_first"],
      rows: [
        ["Trailhead 29 Hardtail", "29-Trailhead-Hardtail"],
        ["Trailhead 29 Carbon", "29-Trailhead-Carbon"],
      ],
    },
    {
      kind: "prose",
      heading: "Choose the simplest text tool that fits",
      body: [
        "Use `SPLIT_PART` when the separator is known, `LEFT` or `SUBSTRING` when the character positions are known, and regex when the pattern can vary. For a fixed prefix, `LIKE 'Volt%'` is usually clearer than regex. A pattern like `[0-9]+` is valuable because it finds model numbers of different lengths, but it is less immediately readable than a simple delimiter.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Pattern matching is PostgreSQL-specific here",
      body: "This playground runs PostgreSQL. `RLIKE` belongs to Spark SQL and Hive, not PostgreSQL. Other interview dialects can also vary in function arguments, escaping rules, and regex engine features. State the dialect before relying on a function or pattern shortcut.",
    },
    {
      kind: "playground-practice",
      title: "Extract product model numbers",
      prompt:
        "Return name and model_number from products for every product name containing a number. Use REGEXP_LIKE(name, '[0-9]+') to keep matching products and REGEXP_SUBSTR(name, '[0-9]+') AS model_number to extract the first number run. Order by id and run the checked PostgreSQL exercise.",
      tables: ["products"],
      successCheck: "5 rows with exactly name and model_number, ordered by id.",
      href: "/sql-playground?practice=cycledepot-product-model-numbers",
    },
    {
      kind: "takeaways",
      items: [
        "In PostgreSQL, use `~`, `~*`, `!~`, and `!~*`, or the explicit `REGEXP_LIKE` function, to test a pattern.",
        "Build patterns from literals, `.`, character classes, negated classes, quantifiers (`+`, `*`, `?`, `{m,n}`), groups, alternatives, and anchors.",
        "Use `^` and `$` to validate the whole value, instead of accidentally matching only part of it.",
        "Parentheses capture pieces. Use SUBSTRING or REGEXP_MATCH to extract them, and `\\1`, `\\2`, and so on to reuse them in REGEXP_REPLACE.",
        "Choose the simplest reliable tool. Fixed positions and delimiters usually deserve ordinary string functions, not a regex.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "regex-digits",
          question: "What does the pattern [0-9]+ match?",
          options: [
            "One or more digits",
            "Exactly nine digits",
            "Only the digit 9",
            "Any alphabetic word",
          ],
          correctIndex: 0,
          explanation: "[0-9] matches one digit, and + repeats that rule one or more times.",
        },
        {
          id: "regex-filter",
          question:
            "Which PostgreSQL condition has the same filtering meaning as WHERE name ~ '[0-9]+'?",
          options: [
            "WHERE REGEXP_LIKE(name, '[0-9]+')",
            "WHERE REGEXP_SUBSTR(name, '[0-9]+')",
            "WHERE RLIKE(name, '[0-9]+')",
            "WHERE REGEXP_REPLACE(name, '[0-9]+', '#')",
          ],
          correctIndex: 0,
          explanation:
            "Both forms test whether name matches the pattern. REGEXP_SUBSTR extracts text, RLIKE is not PostgreSQL syntax, and REGEXP_REPLACE transforms text.",
        },
        {
          id: "regex-anchor",
          question: "What does ^ mean at the beginning of a regex pattern?",
          options: [
            "The match must begin at the start of the text",
            "Match the end of the text",
            "Repeat the previous item",
            "Match a literal caret",
          ],
          correctIndex: 0,
          explanation: "^ anchors the pattern to the start of the value.",
        },
        {
          id: "regex-replace",
          question: "What does REGEXP_REPLACE(name, '[0-9]+', '#', 'g') create?",
          options: [
            "A new value with every digit run replaced by #",
            "A permanent update to name",
            "Only rows with digits",
            "A numeric total",
          ],
          correctIndex: 0,
          explanation:
            "REGEXP_REPLACE returns a transformed result value; it does not modify the stored column.",
        },
        {
          id: "regex-tool-choice",
          question: "Which tool is clearest when text always has one known separator such as @?",
          options: ["SPLIT_PART", "A general regex first", "SUM", "GROUP BY"],
          correctIndex: 0,
          explanation:
            "A simple known delimiter is a natural fit for SPLIT_PART. Use regex when the pattern needs flexibility.",
        },
        {
          id: "regex-bounded-repeat",
          question:
            "Which PostgreSQL pattern matches 11-Speed Cassette because the name starts with exactly two digits and a hyphen?",
          options: ["^[0-9]{2}-", "[0-9]{2}$", "^[A-Za-z]{2}-", "[0-9]+$"],
          correctIndex: 0,
          explanation:
            "^ anchors the beginning, {2} requires exactly two digits, and - is the literal next character.",
        },
        {
          id: "regex-alternatives",
          question: "What does WHERE name ~ '^(Volt|City)' keep?",
          options: [
            "Names beginning with Volt or City",
            "Names containing both Volt and City",
            "Only names ending in City",
            "Every name except Volt and City",
          ],
          correctIndex: 0,
          explanation:
            "Parentheses group the alternatives, | means or, and ^ applies to the beginning of the name.",
        },
        {
          id: "regex-case-insensitive",
          question:
            "Which operator matches a text pattern without caring about letter case in PostgreSQL?",
          options: ["~*", "!~", "~", "*~"],
          correctIndex: 0,
          explanation:
            "~* is the case-insensitive PostgreSQL regex match operator. !~ is a case-sensitive negative match.",
        },
        {
          id: "regex-literal-dot",
          question: "Why is the dot written as \\. in an email regex?",
          options: [
            "To match an actual period",
            "To repeat the preceding character",
            "To match any character",
            "To make the pattern case-insensitive",
          ],
          correctIndex: 0,
          explanation:
            "A bare . means any one character. Escaping it as \\. asks for a literal period.",
        },
        {
          id: "regex-captures",
          question: "In a REGEXP_REPLACE replacement string, what does \\2 refer to?",
          options: [
            "The text captured by the second parenthesized group",
            "The second matching row",
            "The second character of the source text",
            "A two-digit number",
          ],
          correctIndex: 0,
          explanation:
            "Capture groups are numbered from left to right. PostgreSQL replacement strings can reuse them as \\1, \\2, and so on.",
        },
      ],
    },
  ],
};

const stringFunctionsQuiz: LessonContent = {
  slug: "string-functions-quiz",
  title: "String Functions: Final Quiz",
  subtitle:
    "Check your understanding of building, inspecting, cleaning, splitting, and pattern-matching text in SQL.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "strings-final-concat",
          question: "What does CONCAT(name, ' <', email, '>') create for each customer?",
          options: [
            "One combined text value",
            "A permanent change to name and email",
            "A filtered list of customers",
            "A new database table",
          ],
          correctIndex: 0,
          explanation:
            "CONCAT joins the supplied text pieces into one result value. A SELECT query does not update the stored columns.",
        },
        {
          id: "strings-final-substring",
          question: "What does SUBSTRING('Trailhead 29 Hardtail' FROM 11 FOR 2) return?",
          options: ["29", "Tr", "Hardtail", "Trailhead"],
          correctIndex: 0,
          explanation:
            "The first digit is at position 11, and the requested two-character slice is 29.",
        },
        {
          id: "strings-final-length",
          question: "What does LENGTH('Zane Novak') return?",
          options: ["10", "9", "11", "8"],
          correctIndex: 0,
          explanation:
            "LENGTH counts every character, including the space: four letters, one space, and five letters.",
        },
        {
          id: "strings-final-case",
          question: "What happens to the stored category when SELECT uses LOWER(category)?",
          options: [
            "It stays unchanged",
            "It is permanently lowercased",
            "It is deleted",
            "It is converted to NULL",
          ],
          correctIndex: 0,
          explanation:
            "LOWER creates a transformed value in the result. It does not modify the value stored in the table.",
        },
        {
          id: "strings-final-trim",
          question: "What does TRIM('  Road Bikes  ') return?",
          options: ["Road Bikes", "RoadBikes", "  Road Bikes  ", "Road-Bikes"],
          correctIndex: 0,
          explanation:
            "TRIM removes spaces from the beginning and end, but keeps the space inside the words.",
        },
        {
          id: "strings-final-replace",
          question: "What does REPLACE('Trailhead 29', ' ', '-') return?",
          options: ["Trailhead-29", "Trailhead 29", "Trailhead--29", "trailhead-29"],
          correctIndex: 0,
          explanation: "REPLACE changes each exact matching space to a hyphen.",
        },
        {
          id: "strings-final-position",
          question: "What does POSITION('@' IN 'zane.novak1@example.com') return?",
          options: ["12", "11", "13", "1"],
          correctIndex: 0,
          explanation:
            "POSITION starts counting at 1. Eleven characters come before @, so @ is at position 12.",
        },
        {
          id: "strings-final-split-part",
          question: "Which expression returns example.com from zane.novak1@example.com?",
          options: [
            "SPLIT_PART(email, '@', 2)",
            "SPLIT_PART(email, '@', 1)",
            "POSITION('@' IN email)",
            "LEFT(email, 2)",
          ],
          correctIndex: 0,
          explanation: "Part 2 is the text after the @ delimiter. Part 1 is the text before it.",
        },
        {
          id: "strings-final-regex-digits",
          question: "What does the PostgreSQL regex pattern [0-9]+ match?",
          options: [
            "One or more digits",
            "Exactly nine digits",
            "Only the digit 9",
            "One or more letters",
          ],
          correctIndex: 0,
          explanation:
            "[0-9] means one digit, and + repeats the preceding pattern one or more times.",
        },
        {
          id: "strings-final-regex-anchor",
          question: "Which Cycle Depot product name matches the PostgreSQL pattern '^[0-9]+-'?",
          options: [
            "11-Speed Cassette",
            "Trailhead 29 Hardtail",
            "City Commuter 7",
            "1200lm Front Light",
          ],
          correctIndex: 0,
          explanation:
            "^ requires the match at the start, [0-9]+ finds 11, and the literal hyphen immediately follows it.",
        },
      ],
    },
  ],
};

// =============================================================
// NUMERIC FUNCTIONS
// =============================================================
const roundTruncCeilFloor: LessonContent = {
  slug: "round-trunc-ceil-floor",
  title: "ROUND / TRUNC / CEIL / FLOOR: Shape Numbers",
  subtitle:
    "Round Cycle Depot sale prices to cents, cut off extra precision, or move values to whole-number boundaries.",
  sections: [
    {
      kind: "prose",
      heading: "Choose the number shape your report needs",
      body: [
        "Calculations often produce more precision than a report, price tag, or planning rule needs. SQL gives you different tools depending on whether the value should be nearest, cut short, pushed up, or pushed down.",
        "`ROUND` chooses the nearest value at a precision you set. `TRUNC` removes extra digits without rounding. `CEIL` moves to the next integer, while `FLOOR` moves to the lower integer. Each function returns a computed value and leaves the stored Cycle Depot price unchanged.",
      ],
    },
    {
      kind: "image",
      src: roundTruncCeilFloorImg,
      alt: "Cycle Depot sale-price diagram showing 1299.00 multiplied by 0.875 to make 1136.625, then ROUND, TRUNC, CEIL, and FLOOR results.",
      caption:
        "The same Trailhead 29 Hardtail sale calculation produces four valid outputs. The right function depends on the reporting or planning rule.",
    },
    {
      kind: "prose",
      heading: "ROUND returns the nearest value",
      body: [
        "`ROUND(number, decimal_places)` looks at the next digit and returns the nearest value at the requested precision. A 12.5% sale multiplies the list price by 0.875. For the first product, 1136.625 rounds to 1136.63 at two decimal places.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Round Cycle Depot sale prices to the nearest cent",
      code: `SELECT
  name,
  price * 0.875 AS sale_price_raw,
  ROUND(price * 0.875, 2) AS rounded_sale
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption:
        "A deterministic 12.5% sale. ROUND keeps two decimal places and uses the next digit to decide the result.",
      headers: ["name", "sale_price_raw", "rounded_sale"],
      rows: [
        ["Trailhead 29 Hardtail", "1136.62500", "1136.63"],
        ["Trailhead 29 Carbon", "2143.75000", "2143.75"],
        ["Boulder Full Suspension", "2799.12500", "2799.13"],
        ["Switchback Enduro", "3631.25000", "3631.25"],
      ],
    },
    {
      kind: "prose",
      heading: "TRUNC keeps precision without rounding",
      body: [
        "`TRUNC(number, decimal_places)` stops at the requested decimal place and discards everything after it. It does not look at the next digit. That means the same 1136.625 sale price becomes 1136.62, not 1136.63.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep two sale-price decimal places without rounding",
      code: `SELECT
  name,
  price * 0.875 AS sale_price_raw,
  TRUNC(price * 0.875, 2) AS truncated_sale
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption:
        "TRUNC removes digits after the second decimal place, even when the next digit would make ROUND increase the value.",
      headers: ["name", "sale_price_raw", "truncated_sale"],
      rows: [
        ["Trailhead 29 Hardtail", "1136.62500", "1136.62"],
        ["Trailhead 29 Carbon", "2143.75000", "2143.75"],
        ["Boulder Full Suspension", "2799.12500", "2799.12"],
        ["Switchback Enduro", "3631.25000", "3631.25"],
      ],
    },
    {
      kind: "animation",
      variant: "q-round-trunc-ceil-floor",
      caption:
        "Start from the same raw sale price, then compare nearest-cent rounding, cut-off precision, the next whole integer, and the lower whole integer.",
    },
    {
      kind: "prose",
      heading: "CEIL and FLOOR set whole-number bounds",
      body: [
        "`CEIL(number)` returns the smallest integer that is greater than or equal to the value. `FLOOR(number)` returns the largest integer that is less than or equal to the value. For a positive value such as 1136.625, CEIL returns 1137 and FLOOR returns 1136.",
        "Think of CEIL as moving up on the number line and FLOOR as moving down. That distinction matters for planning rules such as a whole-number quantity of packages, seats, or catalog-price bands.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Compare whole-number upper and lower sale-price bounds",
      code: `SELECT
  name,
  price * 0.875 AS sale_price_raw,
  CEIL(price * 0.875) AS ceiling_sale,
  FLOOR(price * 0.875) AS floor_sale
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption:
        "CEIL gives the next whole number and FLOOR gives the lower whole number for each raw sale price.",
      headers: ["name", "sale_price_raw", "ceiling_sale", "floor_sale"],
      rows: [
        ["Trailhead 29 Hardtail", "1136.62500", "1137", "1136"],
        ["Trailhead 29 Carbon", "2143.75000", "2144", "2143"],
        ["Boulder Full Suspension", "2799.12500", "2800", "2799"],
        ["Switchback Enduro", "3631.25000", "3632", "3631"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "For negative values, up and down still follow the number line",
      body: "CEIL(-2.3) is -2 because -2 is the smallest integer greater than or equal to -2.3. FLOOR(-2.3) is -3 because -3 is the largest integer less than or equal to -2.3.",
    },
    {
      kind: "playground-practice",
      title: "Shape Cycle Depot sale prices",
      prompt:
        "Return name, price, rounded_sale, truncated_sale, ceiling_sale, and floor_sale from products. Use price * 0.875 as the sale calculation. ROUND and TRUNC it to two decimal places, then use CEIL and FLOOR without a decimal-place argument. Name every calculated column exactly, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly name, price, rounded_sale, truncated_sale, ceiling_sale, and floor_sale, ordered by id.",
      href: "/sql-playground?practice=cycledepot-shape-sale-prices",
    },
    {
      kind: "takeaways",
      items: [
        "ROUND(number, places) returns the nearest value at the precision you request.",
        "TRUNC(number, places) cuts off extra digits instead of rounding them.",
        "CEIL moves a fractional value up to the next integer, while FLOOR moves it down to the lower integer.",
        "For negative values, CEIL and FLOOR still move up and down on the number line.",
        "Pick the function that matches the business rule instead of treating all precision cleanup as rounding.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "round-nearest-cent",
          question: "What does ROUND(1136.625, 2) return?",
          options: ["1136.63", "1136.62", "1137", "1136"],
          correctIndex: 0,
          explanation:
            "The third decimal place is 5, so ROUND increases the second decimal place from 2 to 3.",
        },
        {
          id: "trunc-no-rounding",
          question: "What does TRUNC(1136.625, 2) return?",
          options: ["1136.62", "1136.63", "1137", "1136"],
          correctIndex: 0,
          explanation:
            "TRUNC keeps the requested places and drops the remaining digits without rounding.",
        },
        {
          id: "ceil-positive",
          question: "Which function returns 1137 from 1136.625?",
          options: ["CEIL", "FLOOR", "TRUNC", "ROUND(value, 2)"],
          correctIndex: 0,
          explanation: "CEIL returns the smallest integer greater than or equal to the value.",
        },
        {
          id: "floor-negative",
          question: "What does FLOOR(-2.3) return?",
          options: ["-3", "-2", "2", "-2.3"],
          correctIndex: 0,
          explanation:
            "FLOOR moves down on the number line to the largest integer less than or equal to the value.",
        },
        {
          id: "price-rule-choice",
          question:
            "Which function fits a policy that must never show more than the raw calculated sale price?",
          options: [
            "TRUNC(price * 0.875, 2)",
            "ROUND(price * 0.875, 2)",
            "CEIL(price * 0.875)",
            "FLOOR(price * 0.875)",
          ],
          correctIndex: 0,
          explanation:
            "TRUNC removes precision without increasing the value. ROUND can increase it when the next digit is 5 or greater.",
        },
      ],
    },
  ],
};

const nullifCoalesce: LessonContent = {
  slug: "nullif-coalesce",
  title: "NULLIF / COALESCE: Safe Math",
  subtitle:
    "Guard a denominator against zero, then choose a clear fallback for reports that would otherwise return NULL.",
  sections: [
    {
      kind: "prose",
      heading: "Make a calculation safe before it reaches a report",
      body: [
        "Division is useful for rates, percentages, and averages, but a denominator of zero makes the calculation undefined. A production report should decide what that case means instead of letting one row stop the query.",
        "`NULLIF` turns one specific value into `NULL`. Used on a denominator, `NULLIF(denominator, 0)` converts only zero into NULL, so division safely returns NULL. `COALESCE` can then replace that NULL with an explicit report value such as 0.0.",
      ],
    },
    {
      kind: "image",
      src: nullifCoalesceImg,
      alt: "Cycle Depot Safe Margin infographic showing a zero-revenue source calculation branching to NULLIF protection, a safe NULL result, a COALESCE fallback of 0.0, or an intentionally kept NULL.",
      caption:
        "NULLIF protects a zero denominator. COALESCE replaces the resulting NULL with the fallback you choose.",
    },
    {
      kind: "prose",
      heading: "Guard the denominator with NULLIF",
      body: [
        "Cycle Depot stores each product's list `price` and `cost`. Margin percentage is margin divided by price. Every current product has a nonzero price, but writing the guard now keeps this report safe if a later import contains a zero-priced row.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Calculate a safe product margin percentage",
      code: `SELECT
  name,
  price,
  cost,
  price - cost AS margin,
  ROUND(100.0 * (price - cost) / NULLIF(price, 0), 1) AS margin_pct
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption:
        "First four Cycle Depot products. The guard is present even though these current prices are all nonzero.",
      headers: ["name", "price", "cost", "margin", "margin_pct"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "780.00", "519.00", "40.0"],
        ["Trailhead 29 Carbon", "2450.00", "1520.00", "930.00", "38.0"],
        ["Boulder Full Suspension", "3199.00", "2010.00", "1189.00", "37.2"],
        ["Switchback Enduro", "4150.00", "2680.00", "1470.00", "35.4"],
      ],
    },
    {
      kind: "animation",
      variant: "q-nullif-coalesce",
      caption:
        "Follow the normal margin calculation, watch NULLIF change only the zero denominator to NULL, then see COALESCE produce the chosen 0.0 report value.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "NULLIF compares two expressions",
      body: "NULLIF(value, match) returns NULL when value equals match. Otherwise it returns value. So NULLIF(price, 0) keeps an ordinary price, while NULLIF(0, 0) returns NULL.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "See the two outcomes of NULLIF directly",
      code: `SELECT
  NULLIF(0, 0) AS guarded_zero,
  NULLIF(12, 0) AS kept_value;`,
    },
    {
      kind: "table",
      caption: "NULLIF changes only the value that matches its second argument.",
      headers: ["guarded_zero", "kept_value"],
      rows: [["NULL", "12"]],
    },
    {
      kind: "prose",
      heading: "Use COALESCE to give NULL a report value",
      body: [
        "`COALESCE(value1, value2, ...)` returns the first argument that is not NULL. Put the calculated value first and your fallback second. This changes the displayed result, not the underlying product data.",
        "The small query-local input below includes a zero-revenue row on purpose. It makes the protected path visible: NULLIF prevents a divide-by-zero error, then COALESCE turns the resulting NULL rate into 0.0 for the report.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Show a 0.0 fallback when a report row has no revenue",
      code: `WITH report_rows (label, margin, revenue) AS (
  VALUES
    ('Trailhead 29 Hardtail', 519.00, 1299.00),
    ('No revenue yet', 0.00, 0.00)
)
SELECT
  label,
  revenue,
  COALESCE(
    ROUND(100.0 * margin / NULLIF(revenue, 0), 1),
    0.0
  ) AS margin_pct
FROM report_rows;`,
    },
    {
      kind: "table",
      caption:
        "The zero-revenue row reaches the fallback instead of raising a divide-by-zero error.",
      headers: ["label", "revenue", "margin_pct"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "40.0"],
        ["No revenue yet", "0.00", "0.0"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Choose the fallback deliberately",
      body: "A fallback of 0.0 says the report should display zero when no rate can be calculated. In another context, keeping NULL may be more honest because it distinguishes an undefined rate from a genuine zero rate.",
    },
    {
      kind: "playground-practice",
      title: "Build safe product margin percentages",
      prompt:
        "Return name, price, cost, and margin_pct from products. Calculate margin_pct as 100.0 times price minus cost, divided by NULLIF(price, 0). Round to one decimal place, wrap the result with COALESCE(..., 0.0), name it margin_pct, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck: "30 rows with exactly name, price, cost, and margin_pct, ordered by id.",
      href: "/sql-playground?practice=cycledepot-safe-product-margins",
    },
    {
      kind: "takeaways",
      items: [
        "Use NULLIF(denominator, 0) to turn only a zero denominator into NULL before division.",
        "A number divided by NULL returns NULL, which keeps the query running safely.",
        "COALESCE returns the first non-NULL argument, so it can supply an intentional report fallback.",
        "A displayed 0.0 and a NULL rate can mean different things. Pick the fallback that matches the business question.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "nullif-zero-denominator",
          question: "What does NULLIF(price, 0) return when price is 0?",
          options: ["0", "NULL", "price", "An error"],
          correctIndex: 1,
          explanation: "NULLIF returns NULL when its two arguments are equal.",
        },
        {
          id: "nullif-nonzero-denominator",
          question: "What does NULLIF(12, 0) return?",
          options: ["NULL", "0", "12", "An error"],
          correctIndex: 2,
          explanation:
            "The arguments are different, so NULLIF returns its first argument unchanged.",
        },
        {
          id: "coalesce-fallback-order",
          question: "Which expression supplies 0.0 only when margin_pct is NULL?",
          options: [
            "COALESCE(margin_pct, 0.0)",
            "NULLIF(margin_pct, 0.0)",
            "COALESCE(0.0, margin_pct)",
            "NULLIF(0.0, margin_pct)",
          ],
          correctIndex: 0,
          explanation:
            "COALESCE reads from left to right and returns the first non-NULL value, so the calculated value must come first.",
        },
        {
          id: "safe-math-meaning",
          question: "Why might a report keep NULL instead of using COALESCE(..., 0.0)?",
          options: [
            "NULL can show that the rate is undefined rather than truly zero",
            "COALESCE always changes stored data",
            "NULLIF cannot be used in SELECT",
            "A zero denominator becomes 1 automatically",
          ],
          correctIndex: 0,
          explanation:
            "An undefined rate and a real zero rate can have different business meanings. COALESCE should reflect the intended display rule.",
        },
      ],
    },
  ],
};

const absSignLeastGreatest: LessonContent = {
  slug: "abs-sign-least-greatest",
  title: "ABS / SIGN / LEAST / GREATEST: Compare Values",
  subtitle:
    "Measure a Cycle Depot price gap, label its direction, and choose the lower or higher value in each row.",
  sections: [
    {
      kind: "prose",
      heading: "Compare numbers without losing the meaning",
      body: [
        "A numeric difference can answer two separate questions: how far apart are the values, and which side is larger? Other reports need the smaller or larger of several values in the same row. SQL has one focused function for each job.",
        "`ABS` removes a sign and keeps a distance. `SIGN` reduces a value to direction: negative, zero, or positive. `LEAST` returns the smallest expression in a row, while `GREATEST` returns the largest. They compute report values without changing the stored Cycle Depot data.",
      ],
    },
    {
      kind: "image",
      src: absSignLeastGreatestImg,
      alt: "Cycle Depot price comparison diagram for Shellcap Road Helmet showing ABS, SIGN, LEAST, and GREATEST results from real price, target, and cost values.",
      caption:
        "A 129.00 helmet is 21.00 below the 150.00 target. ABS keeps the 21.00 distance, SIGN keeps the downward direction, and LEAST or GREATEST chooses between its cost and price.",
    },
    {
      kind: "prose",
      heading: "ABS measures distance from a target",
      body: [
        "Subtracting a target price from a product price creates a signed gap. For Shellcap Road Helmet, 129.00 minus 150.00 is -21.00. The negative sign is useful for direction, but it gets in the way when the only question is the size of the gap.",
        "`ABS(number)` returns the absolute value. It turns -21.00 into 21.00 and leaves a positive gap such as 69.00 positive.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Measure how far selected Cycle Depot products are from a 150.00 target",
      code: `SELECT
  name,
  price,
  price - 150.00 AS price_vs_target,
  ABS(price - 150.00) AS target_gap
FROM products
WHERE id BETWEEN 13 AND 16
ORDER BY id;`,
    },
    {
      kind: "table",
      caption:
        "ABS makes each target gap positive while the raw difference still shows which side of the target the product sits on.",
      headers: ["name", "price", "price_vs_target", "target_gap"],
      rows: [
        ["Shellcap Road Helmet", "129.00", "-21.00", "21.00"],
        ["Shellcap MIPS Pro", "219.00", "69.00", "69.00"],
        ["Kidsafe Helmet", "59.00", "-91.00", "91.00"],
        ["Thermal Bib Tights", "149.00", "-1.00", "1.00"],
      ],
    },
    {
      kind: "prose",
      heading: "SIGN turns a difference into a direction label",
      body: [
        "`SIGN(number)` returns -1 for a negative number, 0 for zero, and 1 for a positive number. This is useful when the report needs a compact direction indicator instead of the full amount.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Label whether each product is below or above the 150.00 target",
      code: `SELECT
  name,
  price - 150.00 AS price_vs_target,
  SIGN(price - 150.00) AS target_direction
FROM products
WHERE id BETWEEN 13 AND 16
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "-1 means below target, 1 means above target, and 0 would mean an exact match.",
      headers: ["name", "price_vs_target", "target_direction"],
      rows: [
        ["Shellcap Road Helmet", "-21.00", "-1"],
        ["Shellcap MIPS Pro", "69.00", "1"],
        ["Kidsafe Helmet", "-91.00", "-1"],
        ["Thermal Bib Tights", "-1.00", "-1"],
      ],
    },
    {
      kind: "animation",
      variant: "q-abs-sign-least-greatest",
      caption:
        "Start with a signed price difference, then separate distance from direction and compare the two financial values within each product row.",
    },
    {
      kind: "prose",
      heading: "LEAST and GREATEST compare values in the same row",
      body: [
        "`LEAST(value1, value2, ...)` returns the smallest supplied value. `GREATEST(value1, value2, ...)` returns the largest. They compare expressions horizontally within every result row, unlike aggregate functions such as MIN and MAX, which summarize values across rows.",
        "For a Cycle Depot product, cost is the lower amount and list price is the higher amount. Keeping the expressions explicit makes the rule easy to reuse when a row has several candidate values.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Choose the lower cost and higher list price for each selected product",
      code: `SELECT
  name,
  price,
  cost,
  LEAST(price, cost) AS lower_amount,
  GREATEST(price, cost) AS higher_amount
FROM products
WHERE id BETWEEN 13 AND 16
ORDER BY id;`,
    },
    {
      kind: "table",
      caption:
        "LEAST and GREATEST make a row-level comparison for every product instead of combining the products into one summary.",
      headers: ["name", "price", "cost", "lower_amount", "higher_amount"],
      rows: [
        ["Shellcap Road Helmet", "129.00", "62.00", "62.00", "129.00"],
        ["Shellcap MIPS Pro", "219.00", "108.00", "108.00", "219.00"],
        ["Kidsafe Helmet", "59.00", "24.00", "24.00", "59.00"],
        ["Thermal Bib Tights", "149.00", "68.00", "68.00", "149.00"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "LEAST and GREATEST are not MIN and MAX",
      body: "LEAST(price, cost) compares values within one product row. MIN(price) would summarize the price column across many rows. Use the row-level functions when the comparison belongs inside each row.",
    },
    {
      kind: "playground-practice",
      title: "Compare Cycle Depot product values",
      prompt:
        "Return name, price, cost, target_gap, target_direction, lower_amount, and higher_amount from products. Measure the gap from 150.00 with ABS(price - 150.00), label it with SIGN(price - 150.00), and use LEAST(price, cost) plus GREATEST(price, cost). Name every calculated column exactly, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly name, price, cost, target_gap, target_direction, lower_amount, and higher_amount, ordered by id.",
      href: "/sql-playground?practice=cycledepot-compare-product-values",
    },
    {
      kind: "takeaways",
      items: [
        "ABS removes the sign from a number so you can measure distance regardless of direction.",
        "SIGN returns -1, 0, or 1 for negative, zero, or positive values.",
        "LEAST returns the smallest expression within each row, while GREATEST returns the largest.",
        "LEAST and GREATEST make row-level comparisons. MIN and MAX summarize a set of rows.",
        "Use the function that preserves the distinction your business question needs: amount, direction, lower value, or higher value.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "abs-gap",
          question: "What does ABS(-21.00) return?",
          options: ["21.00", "-21.00", "-1", "0"],
          correctIndex: 0,
          explanation: "ABS returns the distance from zero, so it removes the negative sign.",
        },
        {
          id: "sign-values",
          question: "What does SIGN(0) return?",
          options: ["0", "1", "-1", "NULL"],
          correctIndex: 0,
          explanation: "SIGN returns 0 when its input is exactly zero.",
        },
        {
          id: "sign-above-target",
          question:
            "A product price is 69.00 above its target. What does SIGN(price - target) return?",
          options: ["1", "-1", "69", "0"],
          correctIndex: 0,
          explanation: "A positive difference maps to 1.",
        },
        {
          id: "least-row-level",
          question: "What does LEAST(129.00, 62.00) return?",
          options: ["62.00", "129.00", "191.00", "-67.00"],
          correctIndex: 0,
          explanation: "LEAST returns the smaller of its supplied expressions.",
        },
        {
          id: "greatest-vs-max",
          question: "Which expression compares price and cost within each product row?",
          options: ["GREATEST(price, cost)", "MAX(price, cost)", "MAX(price)", "SUM(price, cost)"],
          correctIndex: 0,
          explanation:
            "GREATEST is a row-level function that compares the two expressions for each product.",
        },
      ],
    },
  ],
};

const modRemainder: LessonContent = {
  slug: "mod",
  title: "MOD / %: Remainder & Parity",
  subtitle:
    "Use remainders to test real Cycle Depot product IDs for odd/even parity and rotate products through predictable buckets.",
  sections: [
    {
      kind: "prose",
      heading: "A remainder can become a useful label",
      body: [
        "Division normally answers how many whole groups fit into a number. A remainder answers what is left after those groups. That small value is useful for alternating work, testing odd or even IDs, and assigning rows to repeating buckets.",
        "`MOD(dividend, divisor)` returns the remainder. In PostgreSQL, `%` is shorthand for the same operation. The result is always less than the divisor, so `% 2` can only produce 0 or 1 and `MOD(id, 3)` can only produce 0, 1, or 2.",
      ],
    },
    {
      kind: "image",
      src: modRemainderImg,
      alt: "Cycle Depot product-routing diagram showing IDs 1 through 6, their id percent 2 parity remainders, and MOD(id, 3) pickup-wave remainders.",
      caption:
        "Remainder 0 marks even IDs in the parity check. With three buckets, the repeating remainders 0, 1, and 2 become predictable wave labels.",
    },
    {
      kind: "prose",
      heading: "Use % 2 to test odd and even IDs",
      body: [
        "When an integer divides evenly by 2, its remainder is 0, so it is even. Otherwise the remainder is 1, so it is odd. The first six Cycle Depot product IDs alternate exactly this way.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Show the parity remainder for six real product IDs",
      code: `SELECT
  id,
  name,
  id % 2 AS parity_remainder
FROM products
ORDER BY id
LIMIT 6;`,
    },
    {
      kind: "table",
      caption: "0 means the product ID is even; 1 means it is odd.",
      headers: ["id", "name", "parity_remainder"],
      rows: [
        ["1", "Trailhead 29 Hardtail", "1"],
        ["2", "Trailhead 29 Carbon", "0"],
        ["3", "Boulder Full Suspension", "1"],
        ["4", "Switchback Enduro", "0"],
        ["5", "Meridian Road Alloy", "1"],
        ["6", "Meridian Road Carbon", "0"],
      ],
    },
    {
      kind: "prose",
      heading: "MOD and % express the same remainder idea",
      body: [
        "Use `MOD(value, divisor)` when the function form reads more clearly, or `%` when a compact arithmetic expression is easier to scan. Both expressions below assign the same three-wave rotation.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Compare MOD and % for the same three-wave rotation",
      code: `SELECT
  id,
  MOD(id, 3) AS mod_wave,
  id % 3 AS percent_wave
FROM products
ORDER BY id
LIMIT 6;`,
    },
    {
      kind: "table",
      caption: "Both expressions return the same remainder sequence for the first six product IDs.",
      headers: ["id", "mod_wave", "percent_wave"],
      rows: [
        ["1", "1", "1"],
        ["2", "2", "2"],
        ["3", "0", "0"],
        ["4", "1", "1"],
        ["5", "2", "2"],
        ["6", "0", "0"],
      ],
    },
    {
      kind: "animation",
      variant: "q-mod",
      caption:
        "First use % 2 to separate odd and even IDs. Then switch to MOD(id, 3) to cycle the same products through three pickup waves.",
    },
    {
      kind: "prose",
      heading: "Use a remainder to rotate through buckets",
      body: [
        "`MOD(id, 3)` creates three repeating labels. ID 1 receives wave 1, ID 2 receives wave 2, ID 3 receives wave 0, and then the pattern restarts. This is handy for a deterministic rotation when a full scheduling system is unnecessary.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Assign the first six products to three deterministic pickup waves",
      code: `SELECT
  id,
  name,
  MOD(id, 3) AS pickup_wave
FROM products
ORDER BY id
LIMIT 6;`,
    },
    {
      kind: "table",
      caption: "Each wave number repeats every three product IDs.",
      headers: ["id", "name", "pickup_wave"],
      rows: [
        ["1", "Trailhead 29 Hardtail", "1"],
        ["2", "Trailhead 29 Carbon", "2"],
        ["3", "Boulder Full Suspension", "0"],
        ["4", "Switchback Enduro", "1"],
        ["5", "Meridian Road Alloy", "2"],
        ["6", "Meridian Road Carbon", "0"],
      ],
    },
    {
      kind: "playground-practice",
      title: "Route Cycle Depot products by remainder",
      prompt:
        "Return id, name, parity_remainder, and pickup_wave from products. Use id % 2 AS parity_remainder and MOD(id, 3) AS pickup_wave. Name both calculated columns exactly, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly id, name, parity_remainder, and pickup_wave, ordered by id.",
      href: "/sql-playground?practice=cycledepot-route-products-by-remainder",
    },
    {
      kind: "takeaways",
      items: [
        "MOD(dividend, divisor) returns the remainder after division.",
        "% is PostgreSQL shorthand for remainder arithmetic.",
        "A remainder of 0 from id % 2 identifies an even ID, while 1 identifies an odd ID.",
        "MOD(id, 3) repeats 0, 1, and 2, which makes three deterministic row-level buckets.",
        "Remainder-based buckets are stable for a given ID, so use them when the rotation should be predictable.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "mod-basic",
          question: "What does MOD(8, 3) return?",
          options: ["2", "1", "3", "8"],
          correctIndex: 0,
          explanation: "Two whole groups of 3 fit into 8, leaving a remainder of 2.",
        },
        {
          id: "parity-even",
          question: "What does id % 2 return for an even product ID?",
          options: ["0", "1", "2", "NULL"],
          correctIndex: 0,
          explanation: "Even integers divide by 2 with no remainder.",
        },
        {
          id: "parity-odd",
          question: "Which expression identifies odd IDs when its result is 1?",
          options: ["id % 2", "id % 3", "MOD(id, 1)", "id / 2"],
          correctIndex: 0,
          explanation: "An odd integer leaves remainder 1 after division by 2.",
        },
        {
          id: "mod-wave",
          question: "What does MOD(6, 3) return?",
          options: ["0", "1", "2", "3"],
          correctIndex: 0,
          explanation: "Six divides evenly into groups of three, leaving remainder 0.",
        },
        {
          id: "mod-percent",
          question: "Which PostgreSQL expression returns the same value as MOD(id, 3)?",
          options: ["id % 3", "id / 3", "id * 3", "ROUND(id, 3)"],
          correctIndex: 0,
          explanation:
            "% is the remainder operator, so it is equivalent to MOD for this calculation.",
        },
      ],
    },
  ],
};

const powerSqrtLog: LessonContent = {
  slug: "power-sqrt-log",
  title: "POWER / SQRT / EXP / LOG: Model Scale",
  subtitle:
    "Square, root, compound, and compress real Cycle Depot values with four focused numeric functions.",
  sections: [
    {
      kind: "prose",
      heading: "Change the scale, not the source value",
      body: [
        "Some questions need a number on a different scale. A square can make large differences stand out, a square root can pull a large range closer together, exponential growth models repeated multiplication, and a logarithm turns a multiplicative scale into readable steps.",
        "These functions calculate a new expression for each row. They do not modify the `products` table or its stored prices.",
      ],
    },
    {
      kind: "image",
      src: powerSqrtLogImg,
      alt: "Cycle Depot SQL query and result preview showing product prices transformed with POWER and SQRT, alongside EXP and base-10 LOG examples.",
      caption:
        "The preview keeps the raw Cycle Depot price visible, then adds a squared price index and a rounded square root. EXP and LOG handle exponential and logarithmic scales.",
    },
    {
      kind: "prose",
      heading: "POWER raises a value to an exponent",
      body: [
        "`POWER(base, exponent)` multiplies a value by itself as many times as the exponent requests. Here, each price is first divided by 100 so the square is easier to read. `POWER(12.99, 2)` is 168.7401.",
        "A square exaggerates the distance between values. That makes it useful for a deliberately weighted score, but it is not a replacement for a product price or a currency total.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Square a scaled version of four real Cycle Depot prices",
      code: `SELECT
  name,
  price,
  ROUND(POWER(price / 100.0, 2), 4) AS price_index_squared
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "A preview of the first four products, ordered explicitly by id.",
      headers: ["name", "price", "price_index_squared"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "168.7401"],
        ["Trailhead 29 Carbon", "2450.00", "600.2500"],
        ["Boulder Full Suspension", "3199.00", "1023.3601"],
        ["Switchback Enduro", "4150.00", "1722.2500"],
      ],
    },
    {
      kind: "prose",
      heading: "SQRT finds the value that squares back to the input",
      body: [
        "`SQRT(value)` returns the square root. It can make a wide, non-negative measure more compact. For example, the square root of the Trailhead 29 Hardtail price is about 36.042 because 36.042 multiplied by itself is close to 1299.",
        "Square roots often include many decimal places. Casting the result to `numeric` lets PostgreSQL use the two-argument `ROUND` form to make the report result easier to scan.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Show a rounded square-root scale for the same four products",
      code: `SELECT
  name,
  price,
  ROUND(SQRT(price)::numeric, 3) AS price_root
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The root scale grows more slowly than the original price scale.",
      headers: ["name", "price", "price_root"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "36.042"],
        ["Trailhead 29 Carbon", "2450.00", "49.497"],
        ["Boulder Full Suspension", "3199.00", "56.560"],
        ["Switchback Enduro", "4150.00", "64.420"],
      ],
    },
    {
      kind: "animation",
      variant: "q-power-sqrt-log",
      caption:
        "Square a scaled price, pull the price back onto a root scale, then see exponential growth and base-10 logarithmic compression side by side.",
    },
    {
      kind: "prose",
      heading: "EXP compounds and LOG compresses",
      body: [
        "`EXP(x)` calculates e raised to `x`, where e is approximately 2.71828. Each one-step increase multiplies the result by e, so it is useful for continuous-growth models. `EXP(2)` is about 7.389.",
        "In PostgreSQL, `LOG(x)` is a base-10 logarithm. It returns the exponent that produces `x` from 10, so `LOG(1000)` is 3. The input must be positive. Use `LN(x)` when you specifically need the natural logarithm with base e.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Compare an exponential growth factor with a base-10 logarithmic scale",
      code: `WITH steps(step) AS (
  VALUES (0), (1), (2), (3)
)
SELECT
  step,
  ROUND(EXP(step::numeric), 3) AS exp_value,
  POWER(10, step) AS base10_scale,
  LOG(POWER(10, step)) AS log10_scale
FROM steps
ORDER BY step;`,
    },
    {
      kind: "table",
      caption: "LOG maps each power of 10 back to the step that produced it.",
      headers: ["step", "exp_value", "base10_scale", "log10_scale"],
      rows: [
        ["0", "1.000", "1", "0"],
        ["1", "2.718", "10", "1"],
        ["2", "7.389", "100", "2"],
        ["3", "20.086", "1000", "3"],
      ],
    },
    {
      kind: "callout",
      tone: "amber",
      title: "Inputs matter",
      body: "SQRT needs a non-negative input, and LOG needs a positive input. Decide how to handle invalid source values before running these functions in a production query.",
    },
    {
      kind: "playground-practice",
      title: "Model Cycle Depot product scales",
      prompt:
        "Return every product's name, price, price_index_squared, price_root, growth_factor, and log10_price_scale. Use the four numeric functions, round the calculated values as specified, sort by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly name, price, price_index_squared, price_root, growth_factor, and log10_price_scale, ordered by id.",
      href: "/sql-playground?practice=cycledepot-model-product-scales",
    },
    {
      kind: "takeaways",
      items: [
        "POWER(base, exponent) raises a number to the requested exponent.",
        "SQRT(value) returns a square root and needs a non-negative value.",
        "EXP(x) calculates e raised to x, which grows multiplicatively as x increases.",
        "PostgreSQL LOG(x) uses base 10 and needs a positive value. Use LN(x) for a natural logarithm.",
        "Use ROUND when a derived scale needs readable report precision, while keeping the original measure visible for context.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "power-basic",
          question: "What does POWER(5, 2) return?",
          options: ["25", "10", "7", "2.5"],
          correctIndex: 0,
          explanation: "POWER(5, 2) multiplies 5 by itself, producing 25.",
        },
        {
          id: "sqrt-basic",
          question: "What does SQRT(81) return?",
          options: ["9", "40.5", "8", "6561"],
          correctIndex: 0,
          explanation: "9 multiplied by 9 is 81, so its square root is 9.",
        },
        {
          id: "exp-basic",
          question: "Which expression calculates e raised to 2?",
          options: ["EXP(2)", "POWER(2, e)", "LOG(2)", "SQRT(2)"],
          correctIndex: 0,
          explanation:
            "EXP(x) is PostgreSQL's exponential function, which returns e to the x power.",
        },
        {
          id: "log-base",
          question: "In PostgreSQL, what does LOG(1000) return?",
          options: ["3", "100", "10", "6.908"],
          correctIndex: 0,
          explanation: "PostgreSQL LOG is base 10, and 10 raised to 3 equals 1000.",
        },
        {
          id: "log-input",
          question: "Which input is valid for LOG(x)?",
          options: ["A positive number", "Any negative number", "Zero only", "Any text value"],
          correctIndex: 0,
          explanation: "A logarithm requires a positive numeric input.",
        },
      ],
    },
  ],
};

const randomRange: LessonContent = {
  slug: "random-range",
  title: "RANDOM / RAND: Numbers in a Range",
  subtitle:
    "Generate fresh values, scale them into usable ranges, and take changing Cycle Depot product samples.",
  sections: [
    {
      kind: "prose",
      heading: "Randomness is a new draw, not a stored value",
      body: [
        "A random function produces a new value each time the query runs. That makes it useful for simulations, test data, temporary group assignment, and samples. It also means you should not expect the same output twice unless you deliberately control the random seed.",
        "This PostgreSQL playground uses `RANDOM()`. Some other SQL engines call the comparable function `RAND()`, so check the dialect before copying a query between systems.",
      ],
    },
    {
      kind: "image",
      src: randomRangeImg,
      alt: "Cycle Depot random-picks flow showing RANDOM values from zero up to but not including one, a formula that maps values to promo groups one through six, and a three-product random sample.",
      caption:
        "Each random draw falls from 0 up to, but not including, 1. The same draw can be shifted into a whole-number group or used to shuffle product rows for a changing sample.",
    },
    {
      kind: "prose",
      heading: "RANDOM() starts with a fraction from 0 to under 1",
      body: [
        "In PostgreSQL, `RANDOM()` returns a decimal value greater than or equal to 0 and less than 1. It can return 0, but it never returns 1. A result such as 0.63 is only one draw, not a value you can rely on seeing again.",
        "Run this query more than once in the playground and watch the value change. Because the value is intentionally variable, this lesson labels example values as illustrative rather than presenting them as a fixed query result.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Generate one fresh fractional draw",
      code: `SELECT RANDOM() AS raw_random;`,
    },
    {
      kind: "prose",
      heading: "Scale the fraction into a useful integer range",
      body: [
        "To choose an integer from 1 through 6, multiply the random fraction by 6, add 1, then use `FLOOR` to remove the decimal part. The expression before `FLOOR` is at least 1 and less than 7, so the final integer can only be 1 through 6.",
        "The `::int` cast makes the whole-number intent explicit in the result. Here, a product row could receive a temporary promo group without adding a new column to `products`.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Assign each Cycle Depot product a fresh promo group from 1 through 6",
      code: `SELECT
  name,
  FLOOR(RANDOM() * 6 + 1)::int AS promo_group
FROM products
ORDER BY id;`,
    },
    {
      kind: "callout",
      tone: "amber",
      title: "The upper bound needs special care",
      body: "RANDOM() is always less than 1. To make an inclusive whole-number range from min through max, use FLOOR(RANDOM() * (max - min + 1) + min).",
    },
    {
      kind: "animation",
      variant: "q-random-range",
      caption:
        "Watch a fractional random draw become a 1 through 6 group, then watch the same idea shuffle real Cycle Depot products into one possible sample.",
    },
    {
      kind: "prose",
      heading: "Shuffle rows to take a changing product sample",
      body: [
        "`ORDER BY RANDOM()` gives every row a temporary random sort position. `LIMIT 3` then keeps the first three rows after that shuffle. The selected products may differ on every execution.",
        "This is convenient for a small table or an exploratory query. On a large production table, sorting every row randomly can be expensive, so sampling methods designed for your database may be a better fit.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Return one changing three-product Cycle Depot sample",
      code: `SELECT
  name,
  category
FROM products
ORDER BY RANDOM()
LIMIT 3;`,
    },
    {
      kind: "playground-practice",
      title: "Assign random Cycle Depot promo groups",
      prompt:
        "Return every product's name and promo_group. Use FLOOR(RANDOM() * 6 + 1)::int AS promo_group to create a whole number from 1 through 6, sort the source rows by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly name and promo_group, ordered by id. Every promo_group must be an integer from 1 through 6.",
      href: "/sql-playground?practice=cycledepot-assign-random-promo-groups",
    },
    {
      kind: "takeaways",
      items: [
        "PostgreSQL RANDOM() returns a new decimal value from 0 inclusive to 1 exclusive.",
        "Some other SQL dialects call the comparable function RAND(), so confirm the function name before switching databases.",
        "FLOOR(RANDOM() * (max - min + 1) + min) creates a whole-number value from min through max, inclusive.",
        "ORDER BY RANDOM() followed by LIMIT creates a changing row sample, but the order and membership are not repeatable by default.",
        "Random ordering can be costly on large tables, so use it intentionally for exploration and small samples.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "random-range",
          question: "Which range describes PostgreSQL RANDOM()?",
          options: [
            "0 inclusive to 1 exclusive",
            "1 through 10",
            "0 through 1 inclusive",
            "Only whole numbers",
          ],
          correctIndex: 0,
          explanation: "RANDOM() can return 0 but always remains below 1.",
        },
        {
          id: "random-dialect",
          question: "Which function name is used by this PostgreSQL playground?",
          options: ["RANDOM()", "RAND()", "RANDOM_INT()", "PICK()"],
          correctIndex: 0,
          explanation: "PostgreSQL uses RANDOM(). RAND() is common in some other SQL dialects.",
        },
        {
          id: "random-integer",
          question: "Which expression can produce an integer from 1 through 6?",
          options: [
            "FLOOR(RANDOM() * 6 + 1)",
            "RANDOM() * 6",
            "FLOOR(RANDOM() * 5)",
            "RANDOM() + 6",
          ],
          correctIndex: 0,
          explanation:
            "The expression creates a value from 1 up to, but not including, 7, then FLOORS it to 1 through 6.",
        },
        {
          id: "random-sample",
          question: "What does ORDER BY RANDOM() LIMIT 3 do?",
          options: [
            "Returns a changing three-row sample",
            "Always returns the first three rows",
            "Rounds three values",
            "Returns exactly three random decimals",
          ],
          correctIndex: 0,
          explanation:
            "RANDOM() supplies a temporary sort order, and LIMIT keeps the first three rows after that shuffle.",
        },
        {
          id: "random-repeatability",
          question: "Why can the output of a RANDOM() query differ on the next run?",
          options: [
            "It generates a new draw each execution",
            "The products table changes automatically",
            "ORDER BY id is random",
            "RANDOM() stores a permanent value",
          ],
          correctIndex: 0,
          explanation: "Random functions are volatile, so each execution requests new values.",
        },
      ],
    },
  ],
};

const numericFunctionsQuiz: LessonContent = {
  slug: "numeric-functions-quiz",
  title: "Numeric Functions: Final Quiz",
  subtitle:
    "Test your understanding of rounding, safe math, arithmetic functions, and random numbers.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "numeric-final-round",
          question: "What does ROUND(1136.625, 2) return?",
          options: ["1136.63", "1136.62", "1137", "1136"],
          correctIndex: 0,
          explanation: "ROUND keeps two decimal places and rounds up because the next digit is 5.",
        },
        {
          id: "numeric-final-floor-negative",
          question: "What does FLOOR(-2.3) return?",
          options: ["-3", "-2", "2", "-2.3"],
          correctIndex: 0,
          explanation:
            "FLOOR moves down the number line to the greatest integer that is less than or equal to the input.",
        },
        {
          id: "numeric-final-safe-denominator",
          question: "Which expression safely turns a zero denominator into NULL before division?",
          options: [
            "revenue / NULLIF(units_sold, 0)",
            "revenue / COALESCE(units_sold, 0)",
            "NULLIF(revenue / units_sold, 0)",
            "revenue / FLOOR(units_sold)",
          ],
          correctIndex: 0,
          explanation:
            "NULLIF(units_sold, 0) becomes NULL only when units_sold is 0, preventing a divide-by-zero error.",
        },
        {
          id: "numeric-final-coalesce-order",
          question: "Which expression keeps margin_pct when it exists and otherwise displays 0.0?",
          options: [
            "COALESCE(margin_pct, 0.0)",
            "COALESCE(0.0, margin_pct)",
            "NULLIF(margin_pct, 0.0)",
            "NULLIF(0.0, margin_pct)",
          ],
          correctIndex: 0,
          explanation:
            "COALESCE returns the first non-NULL value, so the calculated value belongs first and the fallback second.",
        },
        {
          id: "numeric-final-direction",
          question: "Which function turns price - target into -1, 0, or 1 to show direction?",
          options: ["SIGN", "ABS", "ROUND", "MOD"],
          correctIndex: 0,
          explanation:
            "SIGN reduces a negative, zero, or positive value to its direction. ABS would keep only the distance.",
        },
        {
          id: "numeric-final-row-comparison",
          question: "Which expression returns the higher of price and cost for each product row?",
          options: [
            "GREATEST(price, cost)",
            "MAX(price)",
            "LEAST(price, cost)",
            "SUM(price, cost)",
          ],
          correctIndex: 0,
          explanation:
            "GREATEST compares expressions within each row. MAX(price) would summarize price across a set of rows.",
        },
        {
          id: "numeric-final-parity",
          question: "Which PostgreSQL expression identifies even product IDs when its result is 0?",
          options: ["id % 2", "id / 2", "MOD(id, 1)", "ROUND(id, 2)"],
          correctIndex: 0,
          explanation:
            "An even integer leaves remainder 0 after division by 2. In PostgreSQL, % is remainder shorthand.",
        },
        {
          id: "numeric-final-root",
          question: "Which expression returns 9 from the value 81?",
          options: ["SQRT(81)", "POWER(81, 2)", "EXP(81)", "LOG(81)"],
          correctIndex: 0,
          explanation:
            "SQRT returns the value that, when multiplied by itself, produces the input.",
        },
        {
          id: "numeric-final-log",
          question: "In PostgreSQL, what does LOG(1000) return?",
          options: ["3", "100", "10", "6.908"],
          correctIndex: 0,
          explanation: "PostgreSQL LOG uses base 10, and 10 raised to 3 equals 1000.",
        },
        {
          id: "numeric-final-random-range",
          question: "Which expression can produce a whole-number promo group from 1 through 6?",
          options: [
            "FLOOR(RANDOM() * 6 + 1)",
            "RANDOM() * 6",
            "FLOOR(RANDOM() * 5)",
            "RANDOM() + 6",
          ],
          correctIndex: 0,
          explanation:
            "RANDOM() starts at 0 and remains below 1. Scaling by 6, shifting by 1, and applying FLOOR yields only 1 through 6.",
        },
      ],
    },
  ],
};

// =============================================================
// CONVERSIONS
// =============================================================
const castToChar: LessonContent = {
  slug: "cast-to-char",
  title: "CAST / TO_CHAR (Type Casting)",
  subtitle:
    "Change a value's data type when SQL needs it, then format Cycle Depot values for clear human-readable output.",
  sections: [
    {
      kind: "prose",
      heading: "A value can keep its meaning while changing its representation",
      body: [
        "An integer product ID is useful for database relationships, while a text version is useful when you build a label or key. A numeric price is useful for calculations, while a formatted price is useful when a person reads a report. These jobs look similar but solve different problems.",
        "`CAST(value AS type)` changes the SQL data type of a result expression. `TO_CHAR(value, format)` formats a number or date as text. Both create a new query value and leave the stored Cycle Depot data unchanged.",
      ],
    },
    {
      kind: "image",
      src: castToCharImg,
      alt: "Cycle Depot Type Casting infographic showing Trailhead 29 Hardtail with an integer ID and numeric price branching to a CAST text value, a formatted TO_CHAR price label, and a numeric calculation.",
      caption:
        "CAST changes the type for SQL work. TO_CHAR creates a display-ready text value after the numeric work is complete.",
    },
    {
      kind: "prose",
      heading: "CAST makes the target type explicit",
      body: [
        "Use `CAST(id AS text)` when a number must behave as text in the result. The visible characters can look the same, but the result type is now text. PostgreSQL also offers the short form `id::text`, though the standard CAST form makes the target type especially clear to new readers.",
        "This query keeps the original integer ID next to its text counterpart so you can see that casting changes the type, not the business identity of the product.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Cast Cycle Depot product IDs to text",
      code: `SELECT
  id,
  name,
  CAST(id AS text) AS product_id_text
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption:
        "The product ID is the same identifier in both columns. product_id_text is typed as text for later text operations.",
      headers: ["id", "name", "product_id_text"],
      rows: [
        ["1", "Trailhead 29 Hardtail", "1"],
        ["2", "Trailhead 29 Carbon", "2"],
        ["3", "Boulder Full Suspension", "3"],
        ["4", "Switchback Enduro", "4"],
      ],
    },
    {
      kind: "prose",
      heading: "TO_CHAR formats a value for people",
      body: [
        "`TO_CHAR(price, 'FM$9,999.00')` formats a number as text with a dollar sign, comma separator, and two decimal places. `FM` removes padding spaces, `9` reserves digit positions, and the punctuation becomes part of the display.",
        "A formatted value is text, so use it at the presentation edge of a query. Keep `price` numeric for arithmetic, comparisons, and numeric sorting, then add a formatted column for a report or exported label.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep the numeric price and add a display-ready price label",
      code: `SELECT
  name,
  price,
  TO_CHAR(price, 'FM$9,999.00') AS price_label
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption:
        "price remains numeric for SQL calculations. price_label is text designed for a person to scan.",
      headers: ["name", "price", "price_label"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "$1,299.00"],
        ["Trailhead 29 Carbon", "2450.00", "$2,450.00"],
        ["Boulder Full Suspension", "3199.00", "$3,199.00"],
        ["Switchback Enduro", "4150.00", "$4,150.00"],
      ],
    },
    {
      kind: "animation",
      variant: "q-cast-to-char",
      caption:
        "First change an integer ID into text, then format a numeric Cycle Depot price as a display-ready label without losing the original numeric value.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Format last when you still need math",
      body: "`$1,299.00` is text, not a number to keep calculating with. Calculate and sort with price first, then use TO_CHAR in the final result column for display.",
    },
    {
      kind: "playground-practice",
      title: "Create Cycle Depot text IDs and price labels",
      prompt:
        "Return every product's id, name, product_id_text, and price_label from products. Use CAST(id AS text) AS product_id_text and TO_CHAR(price, 'FM$9,999.00') AS price_label. Name both calculated columns exactly, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck:
        "30 rows with exactly id, name, product_id_text, and price_label, ordered by id.",
      href: "/sql-playground?practice=cycledepot-format-product-identifiers",
    },
    {
      kind: "takeaways",
      items: [
        "CAST(value AS type) changes the data type of a result expression without changing the stored source value.",
        "PostgreSQL also supports the compact ::type cast syntax, but CAST is standard SQL and makes the target type explicit.",
        "TO_CHAR(value, format) formats a numeric or date value as text for readable output.",
        "In FM$9,999.00, FM removes padding, 9 reserves digit positions, and punctuation is displayed literally.",
        "Keep values numeric while you calculate and sort. Format them with TO_CHAR only for the final display.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "cast-id-to-text",
          question: "What is the purpose of CAST(id AS text)?",
          options: [
            "Change the result type to text",
            "Add a new stored ID column",
            "Round the ID",
            "Format the ID as currency",
          ],
          correctIndex: 0,
          explanation:
            "CAST changes the type of the result expression. It does not modify the stored id column.",
        },
        {
          id: "cast-postgres-short-form",
          question: "Which PostgreSQL expression is shorthand for CAST(id AS text)?",
          options: ["id::text", "id::char()", "TEXT(id)", "TO_CHAR(id)"],
          correctIndex: 0,
          explanation: "PostgreSQL uses ::type as its compact cast syntax.",
        },
        {
          id: "to-char-price-label",
          question: "What does TO_CHAR(1299.00, 'FM$9,999.00') return?",
          options: ["$1,299.00", "1299.00", "1299", "1,299"],
          correctIndex: 0,
          explanation:
            "The format adds the currency sign and comma separator while preserving two decimal places.",
        },
        {
          id: "to-char-result-type",
          question: "What type of value does TO_CHAR create?",
          options: ["Text", "Integer", "Decimal", "Date"],
          correctIndex: 0,
          explanation: "TO_CHAR formats its input into a text result for display.",
        },
        {
          id: "format-last",
          question: "Which value should you use to sort product prices numerically?",
          options: ["price", "TO_CHAR(price, 'FM$9,999.00')", "CAST(price AS text)", "price_label"],
          correctIndex: 0,
          explanation:
            "Keep price numeric for math and numeric sorting. The formatted label is text for people to read.",
        },
      ],
    },
  ],
};

const convertLesson: LessonContent = {
  slug: "convert",
  title: "CONVERT",
  subtitle:
    "Recognize CONVERT across SQL dialects, then use the PostgreSQL equivalent that runs in the Cycle Depot playground.",
  sections: [
    {
      kind: "prose",
      heading: "The conversion goal can stay the same while the syntax changes",
      body: [
        "A report may need a Cycle Depot signup date as text, perhaps for an export or a readable label. The goal is simple: turn a date value into characters. The exact command is not universal, though. SQL Server and MySQL use `CONVERT` for common type conversions, while this course playground runs PostgreSQL.",
        "Treat `CONVERT` as a dialect clue, not a portable command you can paste into every database. First identify the database, then choose its conversion syntax. In PostgreSQL, use `CAST(value AS type)` to change a type and `TO_CHAR(value, format)` when you need a controlled text display.",
      ],
    },
    {
      kind: "image",
      src: convertDialectBridgeImg,
      alt: "Cycle Depot conversion map showing one customer signup date branching to SQL Server CONVERT, MySQL CONVERT, and PostgreSQL TO_CHAR syntax, all producing text dates.",
      caption:
        "The conversion intent is the same: make a date readable as text. The function syntax depends on the database that runs the query.",
    },
    {
      kind: "prose",
      heading: "CONVERT is not one cross-database function",
      body: [
        "The reference below shows the same date-to-text intent in three common dialects. It is a syntax guide, not a query to run unchanged in the Cycle Depot playground.",
      ],
    },
    {
      kind: "table",
      caption:
        "Each expression starts with a date and returns text. PostgreSQL uses a different function name for this formatted display.",
      headers: ["database", "date-to-text expression", "what it controls"],
      rows: [
        [
          "SQL Server",
          "CONVERT(varchar(10), signup_date, 23)",
          "target type and style 23",
        ],
        ["MySQL", "CONVERT(signup_date, CHAR)", "target type"],
        [
          "PostgreSQL playground",
          "TO_CHAR(signup_date, 'YYYY-MM-DD')",
          "text display format",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Use CAST for PostgreSQL type conversion",
      body: [
        "The Cycle Depot playground is PostgreSQL, so `CAST(signup_date AS text)` is the direct runnable equivalent when the goal is simply to make the date a text value. The stored `signup_date` remains a date. Only the result expression changes type.",
        "The stable order and limit make the preview easy to inspect. These are the first three real Cycle Depot customer rows, with the same date shown as text beside it.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Cast real Cycle Depot signup dates to text in PostgreSQL",
      code: `SELECT
  id,
  signup_date,
  CAST(signup_date AS text) AS signup_text
FROM customers
ORDER BY id
LIMIT 3;`,
    },
    {
      kind: "table",
      caption:
        "signup_date is still a date value. signup_text contains the same visible date as text.",
      headers: ["id", "signup_date", "signup_text"],
      rows: [
        ["1", "2023-01-06", "2023-01-06"],
        ["2", "2024-06-08", "2024-06-08"],
        ["3", "2023-01-15", "2023-01-15"],
      ],
    },
    {
      kind: "prose",
      heading: "Use TO_CHAR when the text needs a specific shape",
      body: [
        "A cast turns the date into text, but it does not let you choose a display pattern. `TO_CHAR(signup_date, 'YYYY-MM')` intentionally creates a compact year-month label. Use this when the final report needs a particular appearance.",
        "Keep the original date column available for date logic and sorting. Create a formatted text column only at the presentation edge of the query.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Create a compact PostgreSQL signup-month label",
      code: `SELECT
  id,
  signup_date,
  TO_CHAR(signup_date, 'YYYY-MM') AS signup_month
FROM customers
ORDER BY id
LIMIT 3;`,
    },
    {
      kind: "table",
      caption:
        "signup_month is text shaped for a report label, while signup_date remains the original date value.",
      headers: ["id", "signup_date", "signup_month"],
      rows: [
        ["1", "2023-01-06", "2023-01"],
        ["2", "2024-06-08", "2024-06"],
        ["3", "2023-01-15", "2023-01"],
      ],
    },
    {
      kind: "animation",
      variant: "q-convert",
      caption:
        "Start with real Cycle Depot date values, change their result type with CAST, then create an intentionally shaped PostgreSQL text label with TO_CHAR.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do not paste CONVERT into this PostgreSQL playground",
      body: "SQL Server and MySQL have useful CONVERT syntax, but PostgreSQL does not use CONVERT as its general type-casting command. In this course, choose CAST for a type change or TO_CHAR for formatted text output.",
    },
    {
      kind: "playground-practice",
      title: "Create PostgreSQL signup-date text",
      prompt:
        "Return every Cycle Depot customer's id, name, signup_text, and signup_month from customers. Use CAST(signup_date AS text) AS signup_text and TO_CHAR(signup_date, 'YYYY-MM') AS signup_month. Name both calculated columns exactly, order by id, and run the checked exercise.",
      tables: ["customers"],
      successCheck:
        "60 rows with exactly id, name, signup_text, and signup_month, ordered by id.",
      href: "/sql-playground?practice=cycledepot-convert-signup-dates",
    },
    {
      kind: "takeaways",
      items: [
        "CONVERT is a dialect-specific function name, not a type-conversion command that works unchanged in every database.",
        "SQL Server can use CONVERT with a target type and style, while MySQL can use CONVERT(expr, type).",
        "The Cycle Depot playground runs PostgreSQL, where CAST(value AS type) is the direct type-conversion tool.",
        "TO_CHAR(value, format) creates text in an intentional display shape, such as YYYY-MM.",
        "Keep the original date available for date logic and ordering. Add text conversions for final output.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "convert-dialect-clue",
          question: "Why should you identify the database before using CONVERT?",
          options: [
            "Its syntax and availability vary by SQL dialect",
            "It always changes stored data",
            "It only works on numbers",
            "It automatically chooses a date format",
          ],
          correctIndex: 0,
          explanation:
            "CONVERT has different syntax in SQL Server and MySQL, and PostgreSQL uses other tools for general type conversion.",
        },
        {
          id: "convert-postgres-cast",
          question: "Which expression changes a PostgreSQL signup_date result into text?",
          options: [
            "CAST(signup_date AS text)",
            "CONVERT(text, signup_date)",
            "TEXT AS signup_date",
            "signup_date TO text",
          ],
          correctIndex: 0,
          explanation:
            "CAST(value AS type) is PostgreSQL's clear, standard form for changing a result expression's type.",
        },
        {
          id: "convert-to-char-format",
          question: "What does TO_CHAR(signup_date, 'YYYY-MM') let you control?",
          options: [
            "The text display pattern", "The stored date value", "The customer ID", "The query's sort direction"],
          correctIndex: 0,
          explanation:
            "TO_CHAR formats a value into text, so YYYY-MM produces a compact year-month label.",
        },
        {
          id: "convert-sql-server-style",
          question: "In SQL Server, what extra information can CONVERT(varchar(10), signup_date, 23) include?",
          options: [
            "A style code for the display", "A table name", "A row limit", "A join condition"],
          correctIndex: 0,
          explanation:
            "SQL Server's third argument is a style code. Style 23 produces an ISO-style YYYY-MM-DD date display.",
        },
        {
          id: "convert-keep-date",
          question: "Which column should remain available for date comparisons and chronological sorting?",
          options: ["signup_date", "signup_month", "signup_text", "TO_CHAR output only"],
          correctIndex: 0,
          explanation:
            "Keep the original date typed value for date operations. The formatted columns are text for a final display.",
        },
      ],
    },
  ],
};

const implicitCoercion: LessonContent = {
  slug: "implicit-coercion",
  title: "Implicit Coercion",
  subtitle:
    "See how PostgreSQL uses surrounding context to interpret compatible literal values in Cycle Depot queries.",
  sections: [
    {
      kind: "prose",
      heading: "Sometimes PostgreSQL chooses the type for you",
      body: [
        "An expression needs compatible types before PostgreSQL can compare or calculate with it. When a literal has not declared a type, PostgreSQL can often infer one from the surrounding expression. That automatic choice is called implicit coercion.",
        "It is most useful when the context is obvious. In `id = '3'`, the `id` column is an integer, so PostgreSQL interprets the quoted literal as an integer for the comparison. The quote marks do not turn the stored id column into text.",
      ],
    },
    {
      kind: "image",
      src: implicitCoercionImg,
      alt: "Cycle Depot type context infographic showing an untyped quoted 3 flowing into WHERE id = 3, which returns the Boulder Full Suspension product row because the integer id column supplies the type context.",
      caption:
        "The integer id column gives the quoted literal a clear target type, so PostgreSQL can compare the values safely in this simple expression.",
    },
    {
      kind: "prose",
      heading: "A quoted literal can be resolved by an integer column",
      body: [
        "PostgreSQL initially treats a quoted literal such as `'3'` as an untyped string literal. The equality operator and the integer `id` column give it enough context to resolve the literal as an integer. The query therefore finds the real Cycle Depot product with id 3.",
        "This is convenient in a small, obvious query. It is not a reason to blur types everywhere. Parameters from applications, imported text, and expressions with several possible target types deserve an explicit cast so the intended conversion is visible.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "PostgreSQL resolves the quoted product ID from context",
      code: `SELECT
  id,
  name,
  price
FROM products
WHERE id = '3'
ORDER BY id;`,
    },
    {
      kind: "table",
      caption:
        "The query returns the one product whose integer id is 3. The literal is interpreted for this comparison; no stored data changes type.",
      headers: ["id", "name", "price"],
      rows: [["3", "Boulder Full Suspension", "3199.00"]],
    },
    {
      kind: "prose",
      heading: "Numeric context works the same way",
      body: [
        "Coercion also helps expressions use a compatible numeric type. `price` is a decimal value, and `0.875` is a numeric literal. In the multiplication below, PostgreSQL resolves the expression as numeric and returns a numeric sale_price for each product.",
        "The result can carry more decimal places than the stored price. That is expected because the calculation has not rounded the value. Use `ROUND` only when the business question calls for a rounded result.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Let numeric context resolve a sale-rate literal",
      code: `SELECT
  id,
  name,
  price,
  price * 0.875 AS sale_price
FROM products
ORDER BY id
LIMIT 3;`,
    },
    {
      kind: "table",
      caption:
        "The decimal price and the numeric 0.875 literal produce numeric sale_price values. This preview is ordered by id and shows three rows.",
      headers: ["id", "name", "price", "sale_price"],
      rows: [
        ["1", "Trailhead 29 Hardtail", "1299.00", "1136.62500"],
        ["2", "Trailhead 29 Carbon", "2450.00", "2143.75000"],
        ["3", "Boulder Full Suspension", "3199.00", "2799.12500"],
      ],
    },
    {
      kind: "animation",
      variant: "q-implicit-coercion",
      caption:
        "First the integer id column resolves a quoted literal for a product lookup. Then the decimal price column gives a sale-rate literal a compatible numeric context.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Make the type explicit when the intent is not obvious",
      body: "Implicit coercion is context-dependent and PostgreSQL-specific. Prefer CAST when a value arrives from an application or import, when several types could fit, or when you want a query to explain its intended type to the next reader.",
    },
    {
      kind: "playground-practice",
      title: "Use context for a Cycle Depot sale lookup",
      prompt:
        "Return id, name, price, and sale_price for the Cycle Depot product found with the quoted literal WHERE id = '3'. Calculate price * 0.875 AS sale_price, name the column exactly, and order by id. This checked exercise should return one row.",
      tables: ["products"],
      successCheck:
        "One row with exactly id, name, price, and sale_price for Boulder Full Suspension.",
      href: "/sql-playground?practice=cycledepot-use-implicit-coercion",
    },
    {
      kind: "takeaways",
      items: [
        "Implicit coercion is PostgreSQL choosing a compatible type from an expression's surrounding context.",
        "In id = '3', the integer id column provides enough context to resolve the quoted literal for the comparison.",
        "Numeric expressions such as price * 0.875 resolve compatible numeric types without changing the stored price column.",
        "Implicit coercion changes only how the expression is evaluated, never the source column's stored type.",
        "Use an explicit CAST when input is ambiguous, comes from an external source, or needs to document the intended type.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "implicit-coercion-definition",
          question: "What is implicit coercion?",
          options: [
            "PostgreSQL inferring a compatible type from context",
            "Permanently changing a column's type",
            "Formatting a number as currency",
            "Deleting incompatible rows",
          ],
          correctIndex: 0,
          explanation:
            "Implicit coercion resolves expression types at query time. It does not alter the table schema or stored data.",
        },
        {
          id: "implicit-coercion-id-literal",
          question: "Why can WHERE id = '3' work in this PostgreSQL query?",
          options: [
            "The integer id column supplies a clear comparison context",
            "Quote marks make every column text",
            "PostgreSQL ignores the literal type",
            "The products table stores id as text",
          ],
          correctIndex: 0,
          explanation:
            "The equality comparison with an integer column lets PostgreSQL resolve the untyped quoted literal as an integer.",
        },
        {
          id: "implicit-coercion-numeric-result",
          question: "In price * 0.875, what remains unchanged in the products table?",
          options: ["The stored price column", "The sale_price result", "The numeric literal", "The multiplication operator"],
          correctIndex: 0,
          explanation:
            "The expression produces a new result value. It does not update the stored Cycle Depot price.",
        },
        {
          id: "implicit-coercion-explicit-cast",
          question: "When is an explicit CAST the clearer choice?",
          options: [
            "When external input or several possible types make intent unclear",
            "Whenever a query has a WHERE clause",
            "Only when a table has fewer than ten rows",
            "Never, because coercion is always safer",
          ],
          correctIndex: 0,
          explanation:
            "CAST documents the intended target type and is safer when context is not simple or unambiguous.",
        },
        {
          id: "implicit-coercion-dialect",
          question: "Why should implicit-coercion behavior be checked before porting a query?",
          options: [
            "Type-resolution rules vary by SQL dialect",
            "All databases use the same coercion rules",
            "Only PostgreSQL supports integers",
            "A CAST cannot run outside PostgreSQL",
          ],
          correctIndex: 0,
          explanation:
            "Databases can resolve literals and mixed types differently, so portable SQL should make important conversions explicit.",
        },
      ],
    },
  ],
};

const safeCasts: LessonContent = {
  slug: "safe-casts",
  title: "Safe Casts",
  subtitle:
    "Validate imported text before converting it, so malformed Cycle Depot product IDs become intentional NULLs instead of query errors.",
  sections: [
    {
      kind: "prose",
      heading: "Put a gate in front of an unsafe conversion",
      body: [
        "A direct cast such as `raw_product_id::integer` works only when every input is a valid integer. One blank or label such as `'bike-7'` can make the whole query fail.",
        "For imported or application-supplied text, first test whether a value has the shape you accept. Then put the cast inside the matching `CASE` branch. Values that do not pass the test receive NULL, which makes the missing conversion visible without stopping the result.",
      ],
    },
    {
      kind: "image",
      src: safeCastsImg,
      alt: "Cycle Depot safe cast infographic showing incoming text product IDs passing through a friendly regex gate so valid numeric IDs become integers and blank or bike-7 values become NULL.",
      caption:
        "A small query-local incoming-ID preview keeps only digit-shaped values eligible for the integer cast. The malformed values deliberately become NULL.",
    },
    {
      kind: "prose",
      heading: "Validate the text, then cast only the match",
      body: [
        "In PostgreSQL, `~` checks a value against a regular expression. The anchors `^` and `$` mean the entire value must match, and `[0-9]+` means one or more digits. Thus `'1'` and `'3'` pass, while an empty string and `'bike-7'` do not.",
        "`CASE` evaluates the integer cast only for a passing row. With no `ELSE` branch, its fallback is NULL. This query-local preview uses valid IDs from Cycle Depot alongside two intentionally malformed incoming values so the protective path is easy to see.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Safely turn incoming Cycle Depot product-ID text into integers",
      code: `WITH incoming_product_ids(raw_product_id) AS (
  VALUES ('1'), ('3'), (''), ('bike-7')
)
SELECT
  raw_product_id,
  CASE
    WHEN raw_product_id ~ '^[0-9]+$'
      THEN raw_product_id::integer
  END AS safe_product_id
FROM incoming_product_ids
ORDER BY raw_product_id;`,
    },
    {
      kind: "table",
      caption:
        "Exact output from the query-local preview. The input rows are ordered by raw text, and only digit-shaped values are converted.",
      headers: ["raw_product_id", "safe_product_id"],
      rows: [
        ["''", "NULL"],
        ["'1'", "1"],
        ["'3'", "3"],
        ["'bike-7'", "NULL"],
      ],
    },
    {
      kind: "prose",
      heading: "NULLIF cleans a blank, but it is not a complete safe cast",
      body: [
        "`NULLIF(raw_product_id, '')` is useful when blank text should become NULL. It does not validate the other nonblank values. Casting `NULLIF(raw_product_id, '')::integer` protects the empty string, but `'bike-7'` would still cause an invalid-integer error.",
        "Use the narrowest validation rule that represents your input contract. The digits-only rule here is right for positive whole product IDs. A signed quantity, decimal price, or date needs a different rule and a different conversion plan.",
      ],
    },
    {
      kind: "animation",
      variant: "q-safe-casts",
      caption:
        "The first step labels each incoming value as valid or invalid. The second uses that label as a gate: only valid text reaches `::integer`, while every other row stays in the output with NULL.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Safe-cast helpers vary by database",
      body: "This PostgreSQL lesson uses CASE plus a validation rule. Other databases may offer helpers named TRY_CAST or SAFE_CAST, but their syntax and edge cases differ. Check the target dialect before copying a safe-cast pattern.",
    },
    {
      kind: "playground-practice",
      title: "Safely cast incoming Cycle Depot product IDs",
      prompt:
        "Use the supplied query-local `incoming_product_ids` CTE with values '1', '3', '', and 'bike-7'. Return exactly raw_product_id and safe_product_id. With CASE and the PostgreSQL rule `raw_product_id ~ '^[0-9]+$'`, cast only valid rows with `raw_product_id::integer`; invalid rows must be NULL. Order by raw_product_id, then run the checked exercise.",
      tables: [],
      successCheck:
        "Four rows with exactly raw_product_id and safe_product_id: blank and bike-7 map to NULL, while 1 and 3 map to integers.",
      href: "/sql-playground?practice=cycledepot-safely-cast-product-ids",
    },
    {
      kind: "takeaways",
      items: [
        "A direct text-to-integer cast can fail the whole query when one input is malformed.",
        "In PostgreSQL, `~ '^[0-9]+$'` accepts a nonempty value made entirely of digits.",
        "CASE can gate a cast so only validated text reaches the conversion expression.",
        "Without ELSE, CASE returns NULL for a nonmatching value, preserving the row and making the failed conversion explicit.",
        "NULLIF handles one known sentinel such as a blank; use broader validation when other malformed text is possible.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "safe-casts-direct-risk",
          question: "Why is raw_product_id::integer risky for incoming text?",
          options: [
            "One malformed value can make the query fail",
            "It permanently changes the input text",
            "It removes all NULL values",
            "It always rounds decimal values",
          ],
          correctIndex: 0,
          explanation:
            "PostgreSQL raises an invalid-input error if it tries to cast text such as bike-7 to an integer.",
        },
        {
          id: "safe-casts-regex-anchor",
          question: "What does ^[0-9]+$ require in this lesson?",
          options: [
            "The complete value contains one or more digits only",
            "The value starts with a decimal point",
            "The value has any one number somewhere inside it",
            "The value is already an integer column",
          ],
          correctIndex: 0,
          explanation:
            "The anchors require a full match, while [0-9]+ requires at least one digit.",
        },
        {
          id: "safe-casts-case-fallback",
          question: "What does CASE return for bike-7 when there is no ELSE branch?",
          options: ["NULL", "0", "bike-7", "An automatically repaired ID"],
          correctIndex: 0,
          explanation:
            "A CASE expression with no matching WHEN and no ELSE returns NULL.",
        },
        {
          id: "safe-casts-nullif-limit",
          question: "What does NULLIF(raw_product_id, '') protect by itself?",
          options: [
            "A blank string only",
            "Every malformed nonblank value",
            "All invalid dates",
            "Every database dialect",
          ],
          correctIndex: 0,
          explanation:
            "NULLIF turns the specific empty-string sentinel into NULL, but bike-7 remains nonblank and unsafe to cast directly.",
        },
        {
          id: "safe-casts-dialect",
          question: "Why should a safe-cast query be checked for the target database?",
          options: [
            "Safe-cast helpers and syntax differ by SQL dialect",
            "Regular expressions cannot be used in SQL",
            "CASE exists only in PostgreSQL",
            "Every database treats invalid casts as NULL",
          ],
          correctIndex: 0,
          explanation:
            "PostgreSQL can use CASE with a validation condition, while other systems may provide different safe-cast helper functions.",
        },
      ],
    },
  ],
};

const conversionsQuiz: LessonContent = {
  slug: "conversions-quiz",
  title: "Conversions: Final Quiz",
  subtitle:
    "Check your understanding of explicit casts, display formatting, dialect differences, type context, and safe PostgreSQL conversions.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "conversions-final-cast-purpose",
          question: "What does CAST(id AS text) do in a SELECT query?",
          options: [
            "Changes that result expression to text",
            "Permanently changes the id column to text",
            "Adds a new stored column",
            "Formats the ID as a currency amount",
          ],
          correctIndex: 0,
          explanation:
            "CAST changes the type of the value returned by the expression. It does not change the table schema or the stored id values.",
        },
        {
          id: "conversions-final-postgres-shorthand",
          question: "Which PostgreSQL expression is shorthand for CAST(price AS numeric)?",
          options: ["price::numeric", "NUMERIC(price)", "TO_CHAR(price)", "CONVERT(price, numeric)"],
          correctIndex: 0,
          explanation:
            "PostgreSQL supports the compact ::type syntax. CAST(value AS type) is the more portable standard form.",
        },
        {
          id: "conversions-final-to-char",
          question: "What is the result type of TO_CHAR(price, 'FM$9,999.00')?",
          options: ["Text", "Numeric", "Integer", "Date"],
          correctIndex: 0,
          explanation:
            "TO_CHAR formats a number or date into text for display, such as $1,299.00.",
        },
        {
          id: "conversions-final-format-last",
          question: "Why should price remain numeric until the final display step?",
          options: [
            "Numeric values support arithmetic and numeric sorting",
            "TO_CHAR permanently deletes decimals",
            "Formatted text cannot be shown in a result",
            "CAST cannot work with a price column",
          ],
          correctIndex: 0,
          explanation:
            "Do calculations and numeric ordering with price. Add a formatted text label only when the result is ready for people to read.",
        },
        {
          id: "conversions-final-convert-dialect",
          question: "What should you do before copying CONVERT syntax into a query?",
          options: [
            "Check the target SQL dialect",
            "Replace every value with text",
            "Add a GROUP BY clause",
            "Convert the table to a view",
          ],
          correctIndex: 0,
          explanation:
            "CONVERT differs across databases. PostgreSQL uses CAST for a general type conversion and TO_CHAR for formatted text output.",
        },
        {
          id: "conversions-final-postgres-convert",
          question: "Which PostgreSQL expression turns signup_date into a YYYY-MM text label?",
          options: [
            "TO_CHAR(signup_date, 'YYYY-MM')",
            "CONVERT(varchar(7), signup_date, 23)",
            "signup_date::month",
            "CAST(signup_date AS month)",
          ],
          correctIndex: 0,
          explanation:
            "TO_CHAR uses a PostgreSQL format pattern to create a text display label. The other CONVERT form is SQL Server syntax.",
        },
        {
          id: "conversions-final-implicit-context",
          question: "Why can WHERE id = '3' work when id is an integer in PostgreSQL?",
          options: [
            "The integer column gives the literal a clear comparison context",
            "Quote marks change id into a text column",
            "PostgreSQL ignores data types in WHERE",
            "Every quoted literal is permanently numeric",
          ],
          correctIndex: 0,
          explanation:
            "PostgreSQL can resolve the quoted literal from the integer comparison context. The stored id column remains an integer.",
        },
        {
          id: "conversions-final-explicit-input",
          question: "When is an explicit cast clearer than relying on implicit coercion?",
          options: [
            "When external input or the intended target type is unclear",
            "Only when selecting an integer column",
            "Never, because PostgreSQL always guesses correctly",
            "Only after a DELETE statement",
          ],
          correctIndex: 0,
          explanation:
            "An explicit cast documents the intended type and is easier to trust when a value comes from an import or application.",
        },
        {
          id: "conversions-final-direct-cast-risk",
          question: "What can happen if raw_product_id::integer sees the text bike-7?",
          options: [
            "The query can fail with an invalid-integer error",
            "PostgreSQL automatically assigns the next product ID",
            "It always returns 0",
            "The text is silently removed from the table",
          ],
          correctIndex: 0,
          explanation:
            "A direct integer cast expects valid integer text. Malformed input must be handled before the cast is attempted.",
        },
        {
          id: "conversions-final-safe-case",
          question: "In the safe-cast pattern, what does CASE return for a value that does not match ^[0-9]+$ when there is no ELSE branch?",
          options: ["NULL", "0", "The original text", "A random integer"],
          correctIndex: 0,
          explanation:
            "The matching CASE branch contains the cast. A nonmatching row does not run that cast and returns NULL when ELSE is omitted.",
        },
      ],
    },
  ],
};

// =============================================================
// DATE & TIME
// =============================================================
const timeZonesPrecision: LessonContent = {
  slug: "time-zones-precision",
  title: "Current Time & Time Zones",
  subtitle: "NOW / TIMESTAMPTZ / AT TIME ZONE — plus DST",
  sections: [],
};

const extractionFormatting: LessonContent = {
  slug: "extraction-formatting",
  title: "Extraction & Formatting",
  subtitle: "EXTRACT / DATE_PART / TO_CHAR / EXTRACT(EPOCH …) / strftime",
  sections: [],
};

const dateTruncation: LessonContent = {
  slug: "date-truncation",
  title: "Truncation & Bucketing",
  subtitle: "DATE_TRUNC / DATE_BIN / time_bucket",
  sections: [],
};

const dateArithmetic: LessonContent = {
  slug: "date-arithmetic",
  title: "Date Arithmetic & DATEDIFF",
  subtitle: "DATEDIFF / AGE / date − date / EXTRACT(EPOCH FROM b−a)",
  sections: [],
};

const intervalsLookbacks: LessonContent = {
  slug: "intervals-lookbacks",
  title: "Intervals, Lookbacks & Sargable Filters",
  subtitle: "INTERVAL / half-open ranges / anchor to MAX(ts) / index-safe predicates",
  sections: [],
};

const calendarPeriodAnalysis: LessonContent = {
  slug: "calendar-period-analysis",
  title: "Calendar & Period Analysis",
  subtitle: "ISO week / quarter / weekday / period boundaries",
  sections: [],
};

const overlappingRanges: LessonContent = {
  slug: "overlapping-ranges",
  title: "Overlapping Ranges",
  subtitle: "OVERLAPS / range types / && / @> / EXCLUDE USING gist",
  sections: [],
};

const dateSpinesGapFilling: LessonContent = {
  slug: "date-spines-gap-filling",
  title: "Date Spines & Gap Filling",
  subtitle: "GENERATE_SERIES / LEFT JOIN date axis / dim_date / business-day counting",
  sections: [],
};

const dateTimeQuiz: LessonContent = {
  slug: "datetime-quiz",
  title: "Date & Time: Final Quiz",
  subtitle: "Test your knowledge on Date & Time functions.",
  sections: [],
};

// =============================================================
// TOPIC INDEX
// =============================================================

export const SPECIALIZED_TOPICS: Record<string, FoundationTopicMeta> = {
  "string-functions": {
    slug: "string-functions",
    title: "String Functions",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb:
      "CONCAT, UPPER, LOWER, INITCAP, SUBSTRING, TRIM, LTRIM, RTRIM, REPLACE, POSITION, and regex patterns for text wrangling.",
    lessons: [
      concatSubstring,
      leftRightLength,
      upperLower,
      trimReplace,
      positionSplitPart,
      regex,
      stringFunctionsQuiz,
    ],
  },


  "numeric-functions": {
    slug: "numeric-functions",
    title: "Numeric Functions",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "ROUND, TRUNC, CEIL/FLOOR, ABS, MOD/%, POWER/SQRT/EXP/LOG — the math layer of SQL.",
    lessons: [
      roundTruncCeilFloor,
      nullifCoalesce,
      absSignLeastGreatest,
      modRemainder,
      powerSqrtLog,
      randomRange,
      numericFunctionsQuiz,
    ],
  },
  "datetime-functions": {
    slug: "datetime-functions",
    title: "Date & Time",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "Time zones, interval math, and date arithmetic for scheduling and temporal overlaps.",
    lessons: [timeZonesPrecision, extractionFormatting, dateTruncation, dateArithmetic, intervalsLookbacks, calendarPeriodAnalysis, overlappingRanges, dateSpinesGapFilling, dateTimeQuiz],
  },
  conversions: {
    slug: "conversions",
    title: "Conversions",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "CAST and CONVERT — for schema evolution and cross-type operations.",
    lessons: [castToChar, convertLesson, implicitCoercion, safeCasts, conversionsQuiz],
  },
  "error-handling": {
    slug: "error-handling",
    title: "Error Handling",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb:
      "TRY...CATCH (and equivalents) inside SQL scripts to prevent total failure during batch operations.",
    lessons: [],
  },
};
