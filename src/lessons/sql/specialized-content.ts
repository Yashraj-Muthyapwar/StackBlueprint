import type { LessonContent, FoundationTopicMeta } from "./foundations-content";
import concatSubstringImg from "@/images/sql/string-functions/concat-substring-cycle-depot.png";
import leftRightLengthImg from "@/images/sql/string-functions/left-right-length-cycle-depot.png";
import upperLowerImg from "@/images/sql/string-functions/upper-lower-cycle-depot.png";
import trimReplaceImg from "@/images/sql/string-functions/trim-replace-cycle-depot.png";
import positionSplitPartImg from "@/images/sql/string-functions/position-split-part-cycle-depot.png";
import regexImg from "@/images/sql/string-functions/regex-cycle-depot.png";

// =============================================================
// STRING FUNCTIONS
// =============================================================
const concatSubstring: LessonContent = {
  slug: "concat-substring",
  title: "CONCAT / SUBSTRING: Build and Extract Text",
  subtitle: "Join Cycle Depot text into useful labels, then pull out the exact characters you need.",
  sections: [
    {
      kind: "prose",
      heading: "Turn stored text into a useful result",
      body: [
        "Text columns often contain the pieces of a label rather than the label itself. A customer name and email can become one contact card; a long product name can become a short catalog prefix.",
        "`CONCAT` joins text values into one new string. `SUBSTRING` copies a consecutive portion of a string. Both shape the query result only; they do not edit the stored customer or product data.",
      ],
    },
    {
      kind: "image",
      src: concatSubstringImg,
      alt: "A Cycle Depot customer record visual showing two text values merging into a contact card and a highlighted slice being extracted from text.",
      caption: "CONCAT joins text pieces into one value. SUBSTRING copies a selected consecutive piece of text.",
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
        ["Boris Alvarez", "boris.alvarez2@example.com", "Boris Alvarez <boris.alvarez2@example.com>"],
        ["Priya Doyle", "priya.doyle3@example.com", "Priya Doyle <priya.doyle3@example.com>"],
        ["Ugo Mensah", "ugo.mensah4@example.com", "Ugo Mensah <ugo.mensah4@example.com>"],
      ],
    },
    {
      kind: "animation",
      variant: "q-concat-substring",
      caption: "CONCAT joins full text values. SUBSTRING starts at position 1 and returns exactly the requested number of characters.",
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
      body: "In PostgreSQL, CONCAT treats a NULL argument as an empty string, while the || operator returns NULL if either side is NULL. Decide whether a blank or a missing label better represents the report before you build it.",
    },
    {
      kind: "playground-practice",
      title: "Build compact product labels",
      prompt: "Return name, category, and compact_label from products. Use SUBSTRING(name FROM 1 FOR 5) to take the prefix, then use CONCAT to join it to category with ' - '. Name the result compact_label, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck: "30 rows with exactly name, category, and compact_label, ordered by id.",
      href: "/sql-playground?practice=cycledepot-compact-product-labels",
    },
    {
      kind: "takeaways",
      items: [
        "CONCAT joins values and literal separators into one text result.",
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
          options: ["A new stored customer record", "One text value built from the name, email, and separators", "A filter that removes customers without an email", "A numeric count of email addresses"],
          correctIndex: 1,
          explanation: "CONCAT returns one text expression for the current row. It does not modify or filter the table.",
        },
        {
          id: "substring-start",
          question: "What is returned by SUBSTRING('Trailhead' FROM 1 FOR 5)?",
          options: ["railh", "Trail", "Trailhead", "head"],
          correctIndex: 1,
          explanation: "SUBSTRING positions start at 1, so it copies the first five characters: Trail.",
        },
        {
          id: "substring-fixed-length",
          question: "Why can SUBSTRING(name FROM 1 FOR 5) split a word partway through?",
          options: ["It always takes a fixed number of characters", "It only works with product names", "It removes spaces before reading", "It searches for the next word boundary"],
          correctIndex: 0,
          explanation: "A fixed substring counts characters. It does not interpret words or separators.",
        },
        {
          id: "nested-order",
          question: "In CONCAT(SUBSTRING(name FROM 1 FOR 1), '. customer'), which operation happens first?",
          options: ["CONCAT", "ORDER BY", "SUBSTRING", "AS"],
          correctIndex: 2,
          explanation: "SQL evaluates the nested SUBSTRING first, then passes that one-character result to CONCAT.",
        },
      ],
    },
  ],
};

const leftRightLength: LessonContent = {
  slug: "left-right-length",
  title: "LEFT / RIGHT / LENGTH: Inspect Text",
  subtitle: "Take a fixed piece from either end of Cycle Depot text, then count every character.",
  sections: [
    {
      kind: "prose",
      heading: "Inspect text without changing it",
      body: [
        "Customer names and email addresses are stored as complete strings, but a report sometimes needs a short code, a suffix, or a quick data-quality check. `LEFT` copies characters from the beginning of a string. `RIGHT` copies characters from its end. `LENGTH` counts the characters in the string.",
        "These functions create values in the query result. They do not shorten, replace, or otherwise edit the values stored in the `customers` table.",
      ],
    },
    {
      kind: "image",
      src: leftRightLengthImg,
      alt: "A visual showing the beginning of Zane Novak extracted as Zan, the end of an email extracted as example.com, and the ten characters counted in Zane Novak including the space.",
      caption: "LEFT reads from the beginning, RIGHT reads from the ending, and LENGTH counts every character, including spaces.",
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
      caption: "The stored text stays intact. Each function adds a calculated result for the same customer row.",
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
      caption: "Inspect the full customer name, a short code, an email suffix, and the character count together",
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
      kind: "callout",
      tone: "warn",
      title: "Fixed width means fixed width",
      body: "If the requested count is longer than the available text, LEFT and RIGHT return the whole string. They do not pad it or raise an error. Use a delimiter-aware function when the part you need can have a variable length.",
    },
    {
      kind: "playground-practice",
      title: "Create customer text summaries",
      prompt: "Return name, name_code, email_domain, and name_characters from customers. Use LEFT(name, 3), RIGHT(email, 11), and LENGTH(name). Name the calculated columns exactly, order by id, and run the checked exercise.",
      tables: ["customers"],
      successCheck: "60 rows with exactly name, name_code, email_domain, and name_characters, ordered by id.",
      href: "/sql-playground?practice=cycledepot-customer-text-summaries",
    },
    {
      kind: "takeaways",
      items: [
        "LEFT takes a fixed number of characters from the beginning of a text value.",
        "RIGHT takes a fixed number of characters from the end of a text value.",
        "LENGTH counts every character, including spaces and punctuation.",
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
          explanation: "LEFT starts at the beginning and returns the requested three characters: Zan.",
        },
        {
          id: "right-direction",
          question: "What does RIGHT('example.com', 3) return?",
          options: ["exa", "com", "moc", "example.com"],
          correctIndex: 1,
          explanation: "RIGHT counts from the end of the string, so the last three characters are com.",
        },
        {
          id: "length-space",
          question: "Why is LENGTH('Zane Novak') equal to 10?",
          options: ["It counts the space between the names", "It ignores all spaces", "It counts only vowels", "It rounds the name to ten characters"],
          correctIndex: 0,
          explanation: "LENGTH counts all characters in the string, including the space between Zane and Novak.",
        },
        {
          id: "long-request",
          question: "What happens when LEFT('Bike', 10) asks for more characters than the string contains?",
          options: ["It returns Bike", "It adds spaces until there are ten characters", "It raises an error", "It returns an empty value"],
          correctIndex: 0,
          explanation: "LEFT returns the available text when the requested count exceeds the string length.",
        },
      ],
    },
  ],
};

const upperLower: LessonContent = {
  slug: "upper-lower",
  title: "UPPER / LOWER: Standardize Text",
  subtitle: "Format Cycle Depot text consistently without changing the values stored in the table.",
  sections: [
    {
      kind: "prose",
      heading: "Choose the case your result needs",
      body: [
        "The same stored text can need different presentation in different outputs. A product name may need an uppercase catalog label, while a category may need a lowercase value for a machine-readable export.",
        "`UPPER` converts letters to uppercase. `LOWER` converts letters to lowercase. Both return a new text value for each row, so the original `name` or `category` remains available exactly as stored.",
      ],
    },
    {
      kind: "image",
      src: upperLowerImg,
      alt: "A Cycle Depot category called Mountain Bikes stays stored unchanged while UPPER produces MOUNTAIN BIKES and LOWER produces mountain bikes.",
      caption: "UPPER and LOWER format the query result. They do not edit the stored category value.",
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
      caption: "The source text remains visible. UPPER and LOWER add a formatted value beside it for the same product row.",
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
      heading: "Use both forms when an output needs them",
      body: [
        "A query can return the original text and more than one formatted version. This makes the presentation choice explicit and avoids changing the source data just to satisfy one report or export.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Produce both uppercase and lowercase category labels in one result",
      code: `SELECT
  category,
  UPPER(category) AS category_upper,
  LOWER(category) AS category_lower
FROM products
ORDER BY id
LIMIT 6;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Missing text stays missing",
      body: "UPPER(NULL) and LOWER(NULL) return NULL. The functions transform available text; they do not fill in a missing value. A later NULL-handling lesson covers choosing a fallback label deliberately.",
    },
    {
      kind: "playground-practice",
      title: "Create product case labels",
      prompt: "Return name, category, category_upper, and category_lower from products. Use UPPER(category) and LOWER(category), name the calculated columns exactly, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck: "30 rows with exactly name, category, category_upper, and category_lower, ordered by id.",
      href: "/sql-playground?practice=cycledepot-product-case-labels",
    },
    {
      kind: "takeaways",
      items: [
        "UPPER converts letters in a text expression to uppercase.",
        "LOWER converts letters in a text expression to lowercase.",
        "Spaces, numbers, and punctuation stay in the same positions.",
        "Both functions format the query result without editing the stored source value.",
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
          explanation: "UPPER changes the letters in its input to uppercase while preserving the space.",
        },
        {
          id: "lower-result",
          question: "What does LOWER('GPS Cycling Computer') return?",
          options: ["gps cycling computer", "GPS CYCLING COMPUTER", "Gps Cycling Computer", "GPScyclingcomputer"],
          correctIndex: 0,
          explanation: "LOWER changes letters to lowercase and leaves the spaces in place.",
        },
        {
          id: "case-source",
          question: "What happens to the stored category when a SELECT query uses LOWER(category)?",
          options: ["It stays unchanged", "It is permanently lowercased", "It is deleted after the query", "It is sorted alphabetically"],
          correctIndex: 0,
          explanation: "A SELECT expression creates a result value. It does not update the value stored in the table.",
        },
        {
          id: "case-null",
          question: "What does LOWER(NULL) return?",
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
  title: "TRIM / REPLACE: Clean Text",
  subtitle: "Remove unwanted edge spaces and replace exact text in Cycle Depot product labels.",
  sections: [
    {
      kind: "prose",
      heading: "Clean text before you rely on it",
      body: [
        "Text often needs a small cleanup before it becomes a label, export field, or product key. `TRIM` removes spaces from the beginning and end of text. `REPLACE` swaps every exact occurrence of one piece of text for another.",
        "They return cleaned values in the query result. The original product name remains stored exactly as it was, so you can choose the right cleaned form for each output without editing the table.",
      ],
    },
    {
      kind: "image",
      src: trimReplaceImg,
      alt: "A Cycle Depot product name has edge padding removed with TRIM, then its internal spaces are replaced by hyphens with REPLACE.",
      caption: "TRIM removes only edge spaces. REPLACE changes the exact text you specify, including every matching internal space.",
    },
    {
      kind: "prose",
      heading: "TRIM removes edge spaces, not spaces inside words",
      body: [
        "The current Cycle Depot product names are already clean. To make the behavior visible, this query adds one space on each side of a real product name and then removes that temporary padding with `TRIM`. The spaces between `Trailhead`, `29`, and `Hardtail` remain because they are inside the text.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Add temporary edge padding, then remove it with TRIM",
      code: `SELECT
  name,
  TRIM(CONCAT(' ', name, ' ')) AS clean_name
FROM products
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "TRIM returns the same clean product name after removing the temporary edge spaces",
      headers: ["name", "clean_name"],
      rows: [
        ["Trailhead 29 Hardtail", "Trailhead 29 Hardtail"],
        ["Trailhead 29 Carbon", "Trailhead 29 Carbon"],
        ["Boulder Full Suspension", "Boulder Full Suspension"],
        ["Switchback Enduro", "Switchback Enduro"],
      ],
    },
    {
      kind: "animation",
      variant: "q-trim-replace",
      caption: "TRIM removes edge padding while REPLACE changes matching text inside a new result value. The original name remains available in both stages.",
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
      prompt: "Return name and product_key from products. First add one edge space with CONCAT(' ', name, ' '), remove it with TRIM, then use REPLACE to change each internal space to '-'. Name the result product_key, order by id, and run the checked exercise.",
      tables: ["products"],
      successCheck: "30 rows with exactly name and product_key, ordered by id.",
      href: "/sql-playground?practice=cycledepot-clean-product-keys",
    },
    {
      kind: "takeaways",
      items: [
        "TRIM removes spaces from the beginning and end of a text value, not its middle.",
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
          id: "replace-spaces",
          question: "What does REPLACE('Trailhead 29', ' ', '-') return?",
          options: ["Trailhead 29", "Trailhead-29", "Trailhead--29", "trailhead-29"],
          correctIndex: 1,
          explanation: "REPLACE swaps each matching single space with one hyphen.",
        },
        {
          id: "replace-exact-case",
          question: "Will REPLACE('Road Bikes', 'road', 'bike') change the value?",
          options: ["No, because the match has different letter case", "Yes, it returns bike Bikes", "Yes, it returns Road bike", "It returns NULL"],
          correctIndex: 0,
          explanation: "REPLACE looks for the exact characters supplied, including their letter case.",
        },
        {
          id: "nested-cleaning-order",
          question: "In REPLACE(TRIM(text), ' ', '-'), which function runs first?",
          options: ["TRIM", "REPLACE", "ORDER BY", "AS"],
          correctIndex: 0,
          explanation: "The inner TRIM runs first and its cleaned output becomes the input to REPLACE.",
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
      caption: "POSITION finds the `@` marker. SPLIT_PART uses the same marker to return the text before it or after it.",
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
      caption: "First locate the @ marker. Then use it as the delimiter that divides every email into two meaningful parts.",
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
      prompt: "Return email, at_position, email_local, and email_domain from customers. Use POSITION('@' IN email), SPLIT_PART(email, '@', 1), and SPLIT_PART(email, '@', 2). Name the columns exactly, order by id, and run the checked exercise.",
      tables: ["customers"],
      successCheck: "60 rows with exactly email, at_position, email_local, and email_domain, ordered by id.",
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
          question: "If eleven characters come before @ in an email, what does POSITION('@' IN email) return?",
          options: ["12", "11", "0", "13"],
          correctIndex: 0,
          explanation: "POSITION starts counting at 1, so the next character after eleven characters is position 12.",
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
          options: ["SPLIT_PART(email, '@', 2)", "SPLIT_PART(email, '@', 1)", "POSITION('@' IN email)", "LEFT(email, 2)"],
          correctIndex: 0,
          explanation: "The domain is the second piece around the @ delimiter.",
        },
        {
          id: "delimiter-use",
          question: "When is SPLIT_PART a good fit?",
          options: ["When text has a known, simple separator", "When a table needs rows removed", "When every value has an unrelated format", "When numbers need to be added"],
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
  subtitle: "Find, extract, and reshape text when a fixed delimiter or character count is not enough.",
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
      caption: "`[0-9]+` means one or more digits. It matches the model number in Trailhead 29 Hardtail without needing to know that the number is 29.",
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
      caption: "The pattern is tested against each product name. A match can keep a row, extract the matching characters, or reshape them into a new value.",
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
        ["PostgreSQL", "name ~ '[0-9]+' or REGEXP_LIKE(name, '[0-9]+')", "REGEXP_SUBSTR(name, '[0-9]+')"],
        ["MySQL, Oracle, Snowflake", "REGEXP_LIKE(name, '[0-9]+')", "REGEXP_SUBSTR(name, '[0-9]+')"],
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
        ["[[:digit:]] / [[:alpha:]]", "POSIX digit / letter class", "a readable alternative to [0-9] or [A-Za-z]"],
        ["\\d / \\D", "a digit / a non-digit", "\\d+ also matches 29"],
        ["\\w / \\W", "a word character / a non-word character", "the hyphen in 11-Speed is non-word text"],
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
      caption: "Interview pattern recipes: combine the building blocks rather than memorizing one giant regex",
      headers: ["need", "pattern", "what it accepts"],
      rows: [
        ["contains a model number", "[0-9]+", "a run of one or more digits anywhere"],
        ["two-digit model at the start", "^[0-9]{2}-", "11-Speed, but not Trailhead 29"],
        ["one approved prefix", "^(Volt|City)", "names beginning with Volt or City"],
        ["only letters and spaces", "^[A-Za-z ]+$", "the entire value, not just one matching part"],
        ["simple email shape", "^[a-z]+\\.[a-z]+[0-9]+@[a-z]+\\.[a-z]+$", "the five expected pieces of a Cycle Depot email"],
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
      prompt: "Return name and model_number from products for every product name containing a number. Use REGEXP_LIKE(name, '[0-9]+') to keep matching products and REGEXP_SUBSTR(name, '[0-9]+') AS model_number to extract the first number run. Order by id and run the checked PostgreSQL exercise.",
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
          options: ["One or more digits", "Exactly nine digits", "Only the digit 9", "Any alphabetic word"],
          correctIndex: 0,
          explanation: "[0-9] matches one digit, and + repeats that rule one or more times.",
        },
        {
          id: "regex-filter",
          question: "Which PostgreSQL condition has the same filtering meaning as WHERE name ~ '[0-9]+'?",
          options: ["WHERE REGEXP_LIKE(name, '[0-9]+')", "WHERE REGEXP_SUBSTR(name, '[0-9]+')", "WHERE RLIKE(name, '[0-9]+')", "WHERE REGEXP_REPLACE(name, '[0-9]+', '#')"],
          correctIndex: 0,
          explanation: "Both forms test whether name matches the pattern. REGEXP_SUBSTR extracts text, RLIKE is not PostgreSQL syntax, and REGEXP_REPLACE transforms text.",
        },
        {
          id: "regex-anchor",
          question: "What does ^ mean at the beginning of a regex pattern?",
          options: ["The match must begin at the start of the text", "Match the end of the text", "Repeat the previous item", "Match a literal caret"],
          correctIndex: 0,
          explanation: "^ anchors the pattern to the start of the value.",
        },
        {
          id: "regex-replace",
          question: "What does REGEXP_REPLACE(name, '[0-9]+', '#', 'g') create?",
          options: ["A new value with every digit run replaced by #", "A permanent update to name", "Only rows with digits", "A numeric total"],
          correctIndex: 0,
          explanation: "REGEXP_REPLACE returns a transformed result value; it does not modify the stored column.",
        },
        {
          id: "regex-tool-choice",
          question: "Which tool is clearest when text always has one known separator such as @?",
          options: ["SPLIT_PART", "A general regex first", "SUM", "GROUP BY"],
          correctIndex: 0,
          explanation: "A simple known delimiter is a natural fit for SPLIT_PART. Use regex when the pattern needs flexibility.",
        },
        {
          id: "regex-bounded-repeat",
          question: "Which PostgreSQL pattern matches 11-Speed Cassette because the name starts with exactly two digits and a hyphen?",
          options: ["^[0-9]{2}-", "[0-9]{2}$", "^[A-Za-z]{2}-", "[0-9]+$"],
          correctIndex: 0,
          explanation: "^ anchors the beginning, {2} requires exactly two digits, and - is the literal next character.",
        },
        {
          id: "regex-alternatives",
          question: "What does WHERE name ~ '^(Volt|City)' keep?",
          options: ["Names beginning with Volt or City", "Names containing both Volt and City", "Only names ending in City", "Every name except Volt and City"],
          correctIndex: 0,
          explanation: "Parentheses group the alternatives, | means or, and ^ applies to the beginning of the name.",
        },
        {
          id: "regex-case-insensitive",
          question: "Which operator matches a text pattern without caring about letter case in PostgreSQL?",
          options: ["~*", "!~", "~", "*~"],
          correctIndex: 0,
          explanation: "~* is the case-insensitive PostgreSQL regex match operator. !~ is a case-sensitive negative match.",
        },
        {
          id: "regex-literal-dot",
          question: "Why is the dot written as \\. in an email regex?",
          options: ["To match an actual period", "To repeat the preceding character", "To match any character", "To make the pattern case-insensitive"],
          correctIndex: 0,
          explanation: "A bare . means any one character. Escaping it as \\. asks for a literal period.",
        },
        {
          id: "regex-captures",
          question: "In a REGEXP_REPLACE replacement string, what does \\2 refer to?",
          options: ["The text captured by the second parenthesized group", "The second matching row", "The second character of the source text", "A two-digit number"],
          correctIndex: 0,
          explanation: "Capture groups are numbered from left to right. PostgreSQL replacement strings can reuse them as \\1, \\2, and so on.",
        },
      ],
    },
  ],
};

const stringFunctionsQuiz: LessonContent = {
  slug: "string-functions-quiz",
  title: "String Functions: Final Quiz",
  subtitle: "Check your understanding of building, inspecting, cleaning, splitting, and pattern-matching text in SQL.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "strings-final-concat",
          question: "What does CONCAT(name, ' <', email, '>') create for each customer?",
          options: ["One combined text value", "A permanent change to name and email", "A filtered list of customers", "A new database table"],
          correctIndex: 0,
          explanation: "CONCAT joins the supplied text pieces into one result value. A SELECT query does not update the stored columns.",
        },
        {
          id: "strings-final-substring",
          question: "What does SUBSTRING('Trailhead 29 Hardtail' FROM 11 FOR 2) return?",
          options: ["29", "Tr", "Hardtail", "Trailhead"],
          correctIndex: 0,
          explanation: "The first digit is at position 11, and the requested two-character slice is 29.",
        },
        {
          id: "strings-final-length",
          question: "What does LENGTH('Zane Novak') return?",
          options: ["10", "9", "11", "8"],
          correctIndex: 0,
          explanation: "LENGTH counts every character, including the space: four letters, one space, and five letters.",
        },
        {
          id: "strings-final-case",
          question: "What happens to the stored category when SELECT uses LOWER(category)?",
          options: ["It stays unchanged", "It is permanently lowercased", "It is deleted", "It is converted to NULL"],
          correctIndex: 0,
          explanation: "LOWER creates a transformed value in the result. It does not modify the value stored in the table.",
        },
        {
          id: "strings-final-trim",
          question: "What does TRIM('  Road Bikes  ') return?",
          options: ["Road Bikes", "RoadBikes", "  Road Bikes  ", "Road-Bikes"],
          correctIndex: 0,
          explanation: "TRIM removes spaces from the beginning and end, but keeps the space inside the words.",
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
          explanation: "POSITION starts counting at 1. Eleven characters come before @, so @ is at position 12.",
        },
        {
          id: "strings-final-split-part",
          question: "Which expression returns example.com from zane.novak1@example.com?",
          options: ["SPLIT_PART(email, '@', 2)", "SPLIT_PART(email, '@', 1)", "POSITION('@' IN email)", "LEFT(email, 2)"],
          correctIndex: 0,
          explanation: "Part 2 is the text after the @ delimiter. Part 1 is the text before it.",
        },
        {
          id: "strings-final-regex-digits",
          question: "What does the PostgreSQL regex pattern [0-9]+ match?",
          options: ["One or more digits", "Exactly nine digits", "Only the digit 9", "One or more letters"],
          correctIndex: 0,
          explanation: "[0-9] means one digit, and + repeats the preceding pattern one or more times.",
        },
        {
          id: "strings-final-regex-anchor",
          question: "Which Cycle Depot product name matches the PostgreSQL pattern '^[0-9]+-'?",
          options: ["11-Speed Cassette", "Trailhead 29 Hardtail", "City Commuter 7", "1200lm Front Light"],
          correctIndex: 0,
          explanation: "^ requires the match at the start, [0-9]+ finds 11, and the literal hyphen immediately follows it.",
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
  subtitle: "Placeholder for CAST / TO_CHAR (Type Casting)",
  sections: [],
};

const convertLesson: LessonContent = {
  slug: "convert",
  title: "CONVERT",
  subtitle: "Placeholder for CONVERT",
  sections: [],
};

const implicitCoercion: LessonContent = {
  slug: "implicit-coercion",
  title: "Implicit Coercion",
  subtitle: "Placeholder for Implicit Coercion",
  sections: [],
};

const safeCasts: LessonContent = {
  slug: "safe-casts",
  title: "Safe Casts",
  subtitle: "Placeholder for Safe Casts",
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
      "CONCAT, SUBSTRING, TRIM, REPLACE, CHARINDEX/POSITION, and regex patterns for text wrangling.",
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
    blurb: "ROUND, CEIL/FLOOR, ABS, MOD/%, POWER/SQRT — the math layer of SQL.",
    lessons: [],
  },
  "datetime-functions": {
    slug: "datetime-functions",
    title: "Date & Time",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "Time zones, date arithmetic, DATEDIFF / DATE_TRUNC, and interval handling.",
    lessons: [],
  },
  "conversions": {
    slug: "conversions",
    title: "Conversions",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "CAST and CONVERT — for schema evolution and cross-type operations.",
    lessons: [castToChar, convertLesson, implicitCoercion, safeCasts],
  },
  "error-handling": {
    slug: "error-handling",
    title: "Error Handling",
    category: "Specialized Data Handling",
    iconKey: "terminal",
    blurb: "TRY...CATCH (and equivalents) inside SQL scripts to prevent total failure during batch operations.",
    lessons: [],
  },
};
