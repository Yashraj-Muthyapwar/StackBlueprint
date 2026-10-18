import type { BoardNode } from "./rules";

/**
 * The shared System Design component library. Every item is a pre-labelled shape, so a learner
 * drags it onto the board and it already has the name the pass rules look for. The set follows
 * the building blocks that come up in real system design interviews, grouped by role.
 * To add a component, add a row here: it appears in every board's Components palette.
 */

export type ComponentGroup =
  | "Clients"
  | "Edge and networking"
  | "Compute"
  | "Data stores"
  | "Messaging and streaming"
  | "Platform";

export type SystemComponent = {
  id: string;
  label: string;
  group: ComponentGroup;
  tone: NonNullable<BoardNode["tone"]>;
  shape?: BoardNode["shape"];
  /** Square corners for plain rectangles (cache, search index). */
  sharp?: boolean;
  w?: number;
  h?: number;
};

export const SYSTEM_DESIGN_COMPONENTS: SystemComponent[] = [
  // Clients
  { id: "user", label: "User / Client", group: "Clients", tone: "muted" },
  { id: "browser", label: "Web Browser", group: "Clients", tone: "muted" },
  { id: "mobile", label: "Mobile App", group: "Clients", tone: "muted" },
  { id: "third-party", label: "Third-Party API", group: "Clients", tone: "muted" },

  // Edge and networking
  {
    id: "dns",
    label: "DNS",
    group: "Edge and networking",
    tone: "sky",
    shape: "ellipse",
    w: 130,
    h: 80,
  },
  {
    id: "cdn",
    label: "CDN",
    group: "Edge and networking",
    tone: "sky",
    shape: "ellipse",
    w: 130,
    h: 80,
  },
  {
    id: "lb",
    label: "Load Balancer",
    group: "Edge and networking",
    tone: "sky",
    shape: "diamond",
    w: 190,
    h: 100,
  },
  { id: "gateway", label: "API Gateway", group: "Edge and networking", tone: "sky" },
  { id: "rate-limiter", label: "Rate Limiter", group: "Edge and networking", tone: "sky" },

  // Compute
  { id: "web-server", label: "Web Server", group: "Compute", tone: "mint" },
  { id: "app-service", label: "App Service", group: "Compute", tone: "mint" },
  { id: "auth", label: "Auth Service", group: "Compute", tone: "mint" },
  { id: "microservice", label: "Microservice", group: "Compute", tone: "mint" },
  { id: "worker", label: "Background Worker", group: "Compute", tone: "mint" },
  { id: "keygen", label: "Key Generation Service", group: "Compute", tone: "mint", w: 210 },
  { id: "notification", label: "Notification Service", group: "Compute", tone: "mint", w: 200 },

  // Data stores
  {
    id: "sql",
    label: "SQL Database",
    group: "Data stores",
    tone: "violet",
    shape: "cylinder",
    w: 180,
  },
  {
    id: "nosql",
    label: "NoSQL Database",
    group: "Data stores",
    tone: "violet",
    shape: "cylinder",
    w: 190,
  },
  {
    id: "replica",
    label: "Read Replica",
    group: "Data stores",
    tone: "violet",
    shape: "cylinder",
    w: 170,
  },
  { id: "cache", label: "Cache (Redis)", group: "Data stores", tone: "amber", sharp: true },
  {
    id: "object-store",
    label: "Object Storage (S3)",
    group: "Data stores",
    tone: "violet",
    shape: "cylinder",
    w: 220,
  },
  { id: "search", label: "Search Index", group: "Data stores", tone: "violet", sharp: true },
  {
    id: "warehouse",
    label: "Data Warehouse",
    group: "Data stores",
    tone: "violet",
    shape: "cylinder",
    w: 190,
  },

  // Messaging and streaming
  { id: "queue", label: "Message Queue", group: "Messaging and streaming", tone: "rose" },
  { id: "pubsub", label: "Pub/Sub Topic", group: "Messaging and streaming", tone: "rose" },
  { id: "stream", label: "Stream Processor", group: "Messaging and streaming", tone: "rose" },

  // Platform
  { id: "analytics", label: "Analytics Service", group: "Platform", tone: "muted" },
  { id: "monitoring", label: "Monitoring and Alerts", group: "Platform", tone: "muted", w: 210 },
];
