import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  catalog,
  checkHelmetDocument,
  practiceStarter,
  practiceSolution,
} from "@/lessons/mongodb/nosql-fixtures";

export function DocumentCode({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-2/40 p-4 font-mono text-xs leading-6 text-foreground sm:text-sm">
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  );
}

const models = [
  {
    id: "key",
    name: "Key-value",
    question: "Load the cart whose ID is C42.",
    example: 'cart:C42  →  { "items": ["light-202"] }',
    read: "Start with a known key and retrieve its value. The colon is a naming convention in this example, not a required database syntax.",
    tradeoff:
      "A key lookup is a different requirement from searching inside every cart. Check what indexing and value-query features the chosen product offers.",
    product: "Example: Redis. Values can have several supported data types.",
  },
  {
    id: "document",
    name: "Document",
    question: "Show the price and specifications for a front light.",
    example: '{ "_id": "light-202", "price": 35,\n  "specs": { "lumens": 600 } }',
    read: "Read named fields in a document. Related specifications can be nested inside the same record.",
    tradeoff:
      "Decide what belongs together. Repeating shared information across documents makes later changes more work.",
    product: "Example: MongoDB. This is the model used in this track.",
  },
  {
    id: "wide",
    name: "Wide-column",
    question: "Read bike B7's sensor readings for one day in time order.",
    example:
      "Partition: bike B7 / 2026-06-01\n09:00  battery_pct: 82\n09:05  battery_pct: 80\n09:10  battery_pct: 78",
    read: "Design a partition and an ordering around a known read pattern. This is a conceptual layout, not executable CQL.",
    tradeoff:
      "Cassandra designs are query-driven. A new query may require a different table or duplicated data. Wide-column systems do not all share one schema model.",
    product: "Example: Apache Cassandra. It uses defined CQL table schemas.",
  },
  {
    id: "graph",
    name: "Graph",
    question: "Which route did a friend of rider Maya ride?",
    example: "(Maya) ──FOLLOWS──> (Leo)\n(Leo)  ──RODE─────> (Lake loop)",
    read: "Start from a rider node and follow named relationships to another rider and then a route. Nodes and relationships can carry properties.",
    tradeoff:
      "A graph is a candidate when connected paths are central. It is not automatically the best choice for an unrelated cart lookup.",
    product: "Example: Neo4j. This sketch uses directed relationships.",
  },
];

export function ModelExplorer() {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4 sm:p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Choose an access pattern. Each panel uses a small, synthetic example from the same shop.
      </p>
      <Tabs defaultValue="key">
        <TabsList
          aria-label="NoSQL data models"
          className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4"
        >
          {models.map((model) => (
            <TabsTrigger key={model.id} value={model.id}>
              {model.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {models.map((model) => (
          <TabsContent key={model.id} value={model.id} className="mt-5 space-y-4">
            <h3 className="text-lg font-medium">{model.question}</h3>
            <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-2/40 p-4 font-mono text-xs leading-7 sm:text-sm">
              {model.example}
            </pre>
            <p className="text-sm leading-relaxed">{model.read}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Design consequence: </strong>
              {model.tradeoff}
            </p>
            <p className="text-xs text-muted-foreground">{model.product}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function DocumentLab() {
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState<"all" | "commute" | "night">("all");
  const results = catalog.filter((item) => view === "all" || item.tags.includes(view));
  const document = catalog[selected];
  return (
    <div className="space-y-5 rounded-xl border border-hairline bg-surface p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">
        Synthetic catalog • local data inspection, not a live MongoDB query
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2" aria-label="Select product">
            {catalog.map((item, index) => (
              <Button
                key={item._id}
                variant={selected === index ? "default" : "outline"}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          <DocumentCode value={document} />
        </div>
        <Card className="min-w-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Read the document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              <strong>Shared fields:</strong> _id, name, price, specs, and tags appear in both
              products.
            </p>
            <p aria-live="polite">
              <strong>Different shape:</strong>{" "}
              {selected === 0
                ? "The bike has specs.frame_size_cm = 54. It has no lumens field."
                : "The light has specs.lumens = 600. It has no frame_size_cm field."}
            </p>
            <p>
              <strong>Embedded document:</strong> specs groups this product's specifications inside
              braces.
            </p>
            <p>
              <strong>Array:</strong> tags holds multiple strings inside square brackets.
            </p>
            <p className="text-muted-foreground">
              Changing the selected document does not add fields to the other product.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3 border-t border-hairline pt-5">
        <h3 className="font-medium">Vary the question: which products carry a tag?</h3>
        <p className="text-sm text-muted-foreground">
          Filter this two-document fixture by a tag. Both products carry commute; only the light
          carries night. Query syntax comes later.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["all", "commute", "night"] as const).map((tag) => (
            <Button
              key={tag}
              variant={view === tag ? "default" : "outline"}
              aria-pressed={view === tag}
              onClick={() => setView(tag)}
            >
              {tag === "all" ? "All products" : `Tag: ${tag}`}
            </Button>
          ))}
        </div>
        <p role="status" className="text-sm">
          {results.length} matching {results.length === 1 ? "document" : "documents"}
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.tags.join(", ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">
          Only selected fields are shown in this summary. Matching does not change either stored
          fixture document.
        </p>
      </div>
    </div>
  );
}

export function DocumentPractice() {
  const [draft, setDraft] = useState(practiceStarter);
  const [feedback, setFeedback] = useState<ReturnType<typeof checkHelmetDocument> | null>(null);
  const [solutionVisible, setSolutionVisible] = useState(false);
  return (
    <div className="space-y-4 rounded-xl border border-hairline bg-surface p-4 sm:p-6">
      <p className="text-sm leading-relaxed">
        Add a helmet to the synthetic catalog. Keep <code>_id</code> as <code>"helmet-303"</code>{" "}
        and <code>name</code> as <code>"Commuter helmet"</code>. Make <code>price</code> the number{" "}
        <code>65</code>, add <code>"size": "M"</code> inside <code>specs</code>, and keep{" "}
        <code>tags</code> as an array of strings containing <code>"commute"</code>. The helmet must
        not inherit <code>lumens</code> or <code>frame_size_cm</code>.
      </p>
      <p className="text-xs text-muted-foreground">
        This checks JSON structure in your browser. It does not insert a document or connect to
        MongoDB.
      </p>
      <label htmlFor="helmet-document" className="block text-sm font-medium">
        Helmet document (JSON)
      </label>
      <Textarea
        id="helmet-document"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setFeedback(null);
        }}
        spellCheck={false}
        className="min-h-[310px] font-mono text-sm leading-6"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setFeedback(checkHelmetDocument(draft))}>Check document</Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraft(practiceStarter);
            setFeedback(null);
            setSolutionVisible(false);
          }}
        >
          Reset exercise
        </Button>
        <Button
          variant="ghost"
          aria-expanded={solutionVisible}
          onClick={() => setSolutionVisible(!solutionVisible)}
        >
          {solutionVisible ? "Hide example answer" : "Show example answer"}
        </Button>
      </div>
      <div role="status" aria-live="polite">
        {feedback && (
          <p
            className={`rounded-lg border p-3 text-sm leading-relaxed ${feedback.ok ? "border-mint/40 bg-mint/5" : "border-amber-500/40 bg-amber-500/5"}`}
          >
            {feedback.message}
          </p>
        )}
      </div>
      {feedback?.ok && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Accepted document preview</h3>
          <DocumentCode value={feedback.document} />
        </div>
      )}
      {solutionVisible && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            One valid answer. Field order and spacing do not affect the check.
          </p>
          <DocumentCode value={practiceSolution} />
        </div>
      )}
    </div>
  );
}
