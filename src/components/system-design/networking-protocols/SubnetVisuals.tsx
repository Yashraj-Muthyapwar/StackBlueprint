/**
 * SubnetVisuals.tsx
 *
 * Interactive diagrams for the "Subnets & CIDR" lesson.
 * Zero dependencies beyond React. Tailwind classes only, no external UI kit.
 *
 * Wire these into your section renderer:
 *
 *   case "cidr-explorer":        return <CidrExplorer />;
 *   case "subnet-math-steps":    return <SubnetMathSteps />;
 *   case "reserved-ips-diagram": return <ReservedIpsDiagram />;
 *   case "vpc-carve-diagram":    return <VpcCarveDiagram />;
 *   case "animation":
 *     if (section.variant === "vpc-packet-flow") return <VpcPacketFlow />;
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ══════════════════════════════════════════════════════════════════════
   IP math helpers
   ══════════════════════════════════════════════════════════════════════ */

const ipToInt = (ip: string): number =>
  ip.split(".").reduce((acc, oct) => (acc << 8) + (Number(oct) & 255), 0) >>> 0;

const intToIp = (n: number): string => [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join(".");

const maskFromPrefix = (prefix: number): number =>
  prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

const networkId = (ip: number, prefix: number): number => (ip & maskFromPrefix(prefix)) >>> 0;

const broadcastId = (ip: number, prefix: number): number =>
  (networkId(ip, prefix) | (~maskFromPrefix(prefix) >>> 0)) >>> 0;

const inCidr = (ip: number, cidr: string): boolean => {
  const [base, p] = cidr.split("/");
  const prefix = Number(p);
  return networkId(ip, prefix) === networkId(ipToInt(base), prefix);
};

const toBits = (n: number): string => n.toString(2).padStart(32, "0");

const fmt = (n: number): string => n.toLocaleString("en-US");

/* Shared shell so every diagram sits in the lesson flow identically. */
const Panel: React.FC<{
  label: string;
  title: string;
  children: React.ReactNode;
  footnote?: string;
}> = ({ label, title, children, footnote }) => (
  <figure className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/60">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
        {label}
      </span>
      <h4 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
    </div>
    <div className="p-5">{children}</div>
    {footnote && (
      <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
        {footnote}
      </figcaption>
    )}
  </figure>
);

/* ══════════════════════════════════════════════════════════════════════
   1. CIDR EXPLORER
   Drag the prefix and watch the network/host boundary move through
   the 32 bits, with every derived number recalculated live.
   ══════════════════════════════════════════════════════════════════════ */

type Provider = "onprem" | "aws" | "gcp";

const PROVIDER_RESERVED: Record<Provider, { n: number; label: string }> = {
  onprem: { n: 2, label: "On-prem (network + broadcast)" },
  aws: { n: 5, label: "AWS / Azure (5 reserved)" },
  gcp: { n: 4, label: "GCP (4 reserved)" },
};

const PRESETS = [
  { label: "VPC block", ip: "10.0.0.0", prefix: 16 },
  { label: "App subnet", ip: "10.0.64.0", prefix: 20 },
  { label: "Public subnet", ip: "10.0.1.0", prefix: 24 },
  { label: "Smallest AWS subnet", ip: "10.0.5.0", prefix: 28 },
  { label: "WAN link", ip: "192.168.10.112", prefix: 30 },
];

export const CidrExplorer: React.FC = () => {
  const [ip, setIp] = useState("10.0.64.0");
  const [prefix, setPrefix] = useState(20);
  const [provider, setProvider] = useState<Provider>("aws");

  const valid =
    /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split(".").every((o) => Number(o) >= 0 && Number(o) <= 255);

  const stats = useMemo(() => {
    if (!valid) return null;
    const n = ipToInt(ip);
    const net = networkId(n, prefix);
    const bcast = broadcastId(n, prefix);
    const total = Math.pow(2, 32 - prefix);
    const reserved = PROVIDER_RESERVED[provider].n;
    // The "interesting octet" is the one the mask cuts through. If the prefix
    // lands on a whole-octet boundary the network steps by 1 in that octet.
    const rem = prefix % 8;
    const blockOctet = rem === 0 ? prefix / 8 : Math.ceil(prefix / 8);
    const blockSize = rem === 0 ? 1 : Math.pow(2, 8 - rem);
    return {
      bits: toBits(net),
      mask: intToIp(maskFromPrefix(prefix)),
      maskBits: toBits(maskFromPrefix(prefix)),
      network: intToIp(net),
      broadcast: intToIp(bcast),
      first: total > 2 ? intToIp(net + 1) : intToIp(net),
      last: total > 2 ? intToIp(bcast - 1) : intToIp(bcast),
      total,
      usable: Math.max(total - reserved, 0),
      aligned: net === n,
      blockOctet,
      blockSize,
    };
  }, [ip, prefix, provider, valid]);

  return (
    <Panel
      label="Interactive"
      title="CIDR Explorer"
      footnote="Every subnetting question is a question about where the network/host boundary sits. Drag the prefix and watch it move."
    >
      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Address</span>
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value.trim())}
            spellCheck={false}
            className={`w-40 rounded-md border px-3 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-slate-800 dark:text-slate-100 ${
              valid ? "border-slate-300 dark:border-slate-600" : "border-red-400 text-red-600"
            }`}
          />
        </label>

        <label className="flex min-w-[220px] flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Prefix length{" "}
            <span className="font-mono text-blue-600 dark:text-blue-400">/{prefix}</span>
          </span>
          <input
            type="range"
            min={8}
            max={32}
            value={prefix}
            onChange={(e) => setPrefix(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-blue-500 to-orange-400"
            aria-label="Prefix length"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Reserved by
          </span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {(Object.keys(PROVIDER_RESERVED) as Provider[]).map((p) => (
              <option key={p} value={p}>
                {PROVIDER_RESERVED[p].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setIp(p.ip);
              setPrefix(p.prefix);
            }}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {p.label} <span className="font-mono opacity-60">/{p.prefix}</span>
          </button>
        ))}
      </div>

      {stats && (
        <>
          {/* Bit strip */}
          <div className="rounded-lg bg-slate-900 p-4 dark:bg-slate-950">
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
              <span className="text-blue-400">← Network portion ({prefix} bits)</span>
              <span className="text-orange-400">Host portion ({32 - prefix} bits) →</span>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-sm">
              {[0, 1, 2, 3].map((octet) => (
                <div key={octet} className="flex items-center gap-2">
                  <div className="flex">
                    {stats.bits
                      .slice(octet * 8, octet * 8 + 8)
                      .split("")
                      .map((bit, i) => {
                        const idx = octet * 8 + i;
                        const isNetwork = idx < prefix;
                        const isBoundary = idx === prefix;
                        return (
                          <span
                            key={idx}
                            className={[
                              "w-[1.05rem] py-0.5 text-center transition-colors duration-300 motion-reduce:transition-none",
                              isNetwork
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-orange-500/15 text-orange-300",
                              isBoundary
                                ? "border-l-2 border-white/70"
                                : "border-l-2 border-transparent",
                            ].join(" ")}
                          >
                            {bit}
                          </span>
                        );
                      })}
                  </div>
                  {octet < 3 && <span className="text-slate-500">.</span>}
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/10 pt-3 font-mono text-xs text-slate-400">
              <span>
                mask <span className="text-slate-200">{stats.mask}</span>
              </span>
              <span>
                networks step by <span className="text-slate-200">{stats.blockSize}</span> in octet{" "}
                {stats.blockOctet}
              </span>
            </div>
          </div>

          {/* Derived numbers */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { k: "Network ID", v: stats.network, tone: "blue" },
              { k: "First usable", v: stats.first, tone: "slate" },
              { k: "Last usable", v: stats.last, tone: "slate" },
              { k: "Broadcast", v: stats.broadcast, tone: "orange" },
              { k: "Total addresses", v: fmt(stats.total), tone: "slate" },
              {
                k: `Usable (−${PROVIDER_RESERVED[provider].n})`,
                v: fmt(stats.usable),
                tone: "green",
              },
            ].map((cell) => (
              <div
                key={cell.k}
                className={`rounded-lg border p-3 ${
                  cell.tone === "blue"
                    ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40"
                    : cell.tone === "orange"
                      ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40"
                      : cell.tone === "green"
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
                }`}
              >
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {cell.k}
                </div>
                <div className="mt-1 break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {cell.v}
                </div>
              </div>
            ))}
          </div>

          {!stats.aligned && (
            <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <strong>
                {ip}/{prefix}
              </strong>{" "}
              is not a valid network boundary. A network ID must be divisible by its block size, so
              this range actually starts at <span className="font-mono">{stats.network}</span>. Most
              routers and cloud APIs will reject the address you typed.
            </p>
          )}
        </>
      )}
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   2. SUBNET MATH STEPS
   The bitwise AND, one step at a time.
   ══════════════════════════════════════════════════════════════════════ */

const MATH_IP = "10.0.72.19";
const MATH_PREFIX = 20;

export const SubnetMathSteps: React.FC = () => {
  const [step, setStep] = useState(0);
  const ipInt = ipToInt(MATH_IP);
  const maskInt = maskFromPrefix(MATH_PREFIX);
  const netInt = networkId(ipInt, MATH_PREFIX);

  const steps = [
    {
      title: "Start with the destination address",
      detail:
        "A packet arrives addressed to 10.0.72.19. The router has no idea yet which subnet that belongs to.",
    },
    {
      title: "Write the address in binary",
      detail: "32 bits, four groups of eight. Nothing clever here, just a different base.",
    },
    {
      title: "Write the mask underneath",
      detail: "A /20 means twenty 1s, then twelve 0s. In decimal that is 255.255.240.0.",
    },
    {
      title: "AND the two together, bit by bit",
      detail:
        "1 AND 1 = 1. Everything else = 0. The mask's 1s let the address bits through; the mask's 0s wipe them out.",
    },
    {
      title: "Read the result: that is the network ID",
      detail:
        "10.0.64.0. The router looks this up in its routing table and forwards the packet. This single operation is the whole of IP routing.",
    },
  ];

  const Row: React.FC<{
    label: string;
    bits: string;
    decimal: string;
    tone: "ip" | "mask" | "net";
    dim?: boolean;
  }> = ({ label, bits, decimal, tone, dim }) => (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 transition-opacity duration-300 motion-reduce:transition-none ${
        dim ? "opacity-25" : "opacity-100"
      }`}
    >
      <span className="w-24 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="font-mono text-sm tracking-tight">
        {[0, 1, 2, 3].map((o) => (
          <React.Fragment key={o}>
            <span>
              {bits
                .slice(o * 8, o * 8 + 8)
                .split("")
                .map((b, i) => {
                  const idx = o * 8 + i;
                  const net = idx < MATH_PREFIX;
                  return (
                    <span
                      key={idx}
                      className={
                        tone === "mask"
                          ? net
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-orange-500"
                          : tone === "net"
                            ? net
                              ? "font-semibold text-blue-700 dark:text-blue-300"
                              : "text-slate-400"
                            : "text-slate-700 dark:text-slate-200"
                      }
                    >
                      {b}
                    </span>
                  );
                })}
            </span>
            {o < 3 && <span className="px-1 text-slate-400">.</span>}
          </React.Fragment>
        ))}
      </span>
      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {decimal}
      </span>
    </div>
  );

  return (
    <Panel
      label="Walkthrough"
      title="How a router finds the network ID"
      footnote="Bitwise AND against the mask. Every routing decision on the internet starts here."
    >
      <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
        <Row label="Address" bits={toBits(ipInt)} decimal={MATH_IP} tone="ip" dim={step < 1} />
        <Row
          label={`Mask /${MATH_PREFIX}`}
          bits={toBits(maskInt)}
          decimal={intToIp(maskInt)}
          tone="mask"
          dim={step < 2}
        />
        <div
          className={`ml-24 border-t border-slate-300 pt-1 text-xs font-semibold text-slate-500 transition-opacity duration-300 dark:border-slate-600 motion-reduce:transition-none ${
            step < 3 ? "opacity-0" : "opacity-100"
          }`}
        >
          AND
        </div>
        <Row
          label="Network ID"
          bits={toBits(netInt)}
          decimal={intToIp(netInt)}
          tone="net"
          dim={step < 4}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          Next step
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {step + 1} of {steps.length}
        </span>
      </div>

      <div className="mt-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 px-4 py-3 dark:bg-blue-950/30">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {steps[step].title}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{steps[step].detail}</p>
      </div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   3. RESERVED IPS DIAGRAM
   The five addresses the cloud takes out of every subnet.
   ══════════════════════════════════════════════════════════════════════ */

const RESERVED_NOTES: Record<number, { title: string; body: string }> = {
  0: {
    title: "Network address",
    body: "The name of the subnet itself. Never assignable, on-prem or in the cloud.",
  },
  1: {
    title: "VPC router",
    body: "The default gateway for everything in this subnet. Your instance's route to anywhere else starts here.",
  },
  2: {
    title: "DNS resolver",
    body: "AWS maps the VPC's .2 address to the Route 53 Resolver. This is what /etc/resolv.conf points at.",
  },
  3: {
    title: "Held for future use",
    body: "AWS reserves it and has never said what for. You still cannot have it.",
  },
  255: {
    title: "Broadcast address",
    body: "Reserved for compatibility. AWS does not support broadcast at all, but the address is still off limits.",
  },
};

export const ReservedIpsDiagram: React.FC = () => {
  const [hover, setHover] = useState<number | null>(null);
  const note = hover !== null ? RESERVED_NOTES[hover] : null;

  return (
    <Panel
      label="Cloud gotcha"
      title="10.0.1.0/24 in AWS: 256 addresses, 251 for you"
      footnote="Hover a red cell. The same five disappear from every subnet you create, which is why a /28 gives you 11 usable addresses and not 16."
    >
      <div className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-[2px]">
        {Array.from({ length: 256 }, (_, i) => {
          const reserved = i <= 3 || i === 255;
          return (
            <button
              key={i}
              onMouseEnter={() => reserved && setHover(i)}
              onFocus={() => reserved && setHover(i)}
              onMouseLeave={() => setHover(null)}
              aria-label={`10.0.1.${i}${reserved ? " reserved" : " usable"}`}
              className={`aspect-square rounded-[2px] transition-transform duration-150 motion-reduce:transition-none ${
                reserved
                  ? "bg-red-500 hover:scale-150 hover:bg-red-400"
                  : "bg-emerald-400/60 dark:bg-emerald-500/40"
              } ${hover === i ? "scale-150 ring-2 ring-red-300" : ""}`}
            />
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-red-500" /> 5 reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-emerald-400/60" /> 251 usable
        </span>
      </div>

      <div className="mt-3 min-h-[68px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        {note && hover !== null ? (
          <>
            <p className="font-mono text-sm font-semibold text-red-600 dark:text-red-400">
              10.0.1.{hover} · {note.title}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{note.body}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hover one of the red cells to see which address AWS took and why.
          </p>
        )}
      </div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   4. VPC CARVE DIAGRAM
   Watch a /16 become tiers, then AZ subnets.
   ══════════════════════════════════════════════════════════════════════ */

type Slice = { name: string; cidr: string; size: number; tone: string; note?: string };

const TIERS: { key: string; label: string; cidr: string; tone: string; children: Slice[] }[] = [
  {
    key: "public",
    label: "Public tier",
    cidr: "10.0.0.0/18",
    tone: "bg-sky-500",
    children: [
      {
        name: "public-1a",
        cidr: "10.0.0.0/24",
        size: 256,
        tone: "bg-sky-500",
        note: "ALB, NAT GW, bastion",
      },
      { name: "public-1b", cidr: "10.0.1.0/24", size: 256, tone: "bg-sky-500" },
      { name: "public-1c", cidr: "10.0.2.0/24", size: 256, tone: "bg-sky-500" },
      {
        name: "spare",
        cidr: "10.0.3.0 → 10.0.63.255",
        size: 15616,
        tone: "bg-slate-300 dark:bg-slate-700",
        note: "held for a 4th AZ",
      },
    ],
  },
  {
    key: "app",
    label: "Private app tier",
    cidr: "10.0.64.0/18",
    tone: "bg-indigo-500",
    children: [
      {
        name: "app-1a",
        cidr: "10.0.64.0/20",
        size: 4096,
        tone: "bg-indigo-500",
        note: "EKS pods burn real VPC IPs",
      },
      { name: "app-1b", cidr: "10.0.80.0/20", size: 4096, tone: "bg-indigo-500" },
      { name: "app-1c", cidr: "10.0.96.0/20", size: 4096, tone: "bg-indigo-500" },
      { name: "spare", cidr: "10.0.112.0/20", size: 4096, tone: "bg-slate-300 dark:bg-slate-700" },
    ],
  },
  {
    key: "data",
    label: "Private data tier",
    cidr: "10.0.128.0/18",
    tone: "bg-emerald-500",
    children: [
      {
        name: "data-1a",
        cidr: "10.0.128.0/22",
        size: 1024,
        tone: "bg-emerald-500",
        note: "RDS, ElastiCache, MSK ENIs",
      },
      { name: "data-1b", cidr: "10.0.132.0/22", size: 1024, tone: "bg-emerald-500" },
      { name: "data-1c", cidr: "10.0.136.0/22", size: 1024, tone: "bg-emerald-500" },
      {
        name: "spare",
        cidr: "10.0.140.0 → 10.0.191.255",
        size: 13312,
        tone: "bg-slate-300 dark:bg-slate-700",
      },
    ],
  },
  {
    key: "growth",
    label: "Growth reserve",
    cidr: "10.0.192.0/18",
    tone: "bg-amber-500",
    children: [
      {
        name: "unallocated",
        cidr: "10.0.192.0/18",
        size: 16384,
        tone: "bg-amber-400",
        note: "4th AZ, pod CIDRs, a future tier",
      },
    ],
  },
];

const CARVE_CAPTIONS = [
  "One VPC. 10.0.0.0/16, 65,536 addresses, and no structure yet. This is the only decision you cannot undo later.",
  "Reserve by tier before you think about zones. Four equal /18 blocks: public, app, data, and one held back for growth.",
  "Public tier: a /24 per AZ is plenty for load balancer ENIs and NAT gateways. Almost the whole /18 stays free.",
  "App tier: /20 per AZ. Looks oversized until every Kubernetes pod takes a real VPC address.",
  "Data tier: /22 per AZ. A handful of managed database ENIs, sized with room rather than precision.",
  "The finished plan. Three AZs live, a spare slot in every tier, and a quarter of the VPC still untouched.",
];

export const VpcCarveDiagram: React.FC = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= 5) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1800);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const tierVisible = (i: number) => step >= 2 + i;

  return (
    <Panel
      label="Animated"
      title="Carving 10.0.0.0/16 into a production VPC"
      footnote="Reserve tiers first, carve AZ subnets second, and never allocate the last slot. Widths are proportional to real address counts."
    >
      {/* Master bar */}
      <div className="mb-1 flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-mono">10.0.0.0</span>
        <span className="font-semibold">VPC · 65,536 addresses</span>
        <span className="font-mono">10.0.255.255</span>
      </div>
      <div className="flex h-12 w-full overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
        {step === 0 ? (
          <div className="flex w-full items-center justify-center bg-slate-800 font-mono text-sm text-white">
            10.0.0.0/16
          </div>
        ) : (
          TIERS.map((t) => (
            <div
              key={t.key}
              className={`flex w-1/4 flex-col items-center justify-center border-r border-white/40 text-white transition-all duration-700 last:border-r-0 motion-reduce:transition-none ${t.tone}`}
            >
              <span className="text-[11px] font-semibold">{t.label}</span>
              <span className="font-mono text-[10px] opacity-80">{t.cidr}</span>
            </div>
          ))
        )}
      </div>

      {/* Tier rows */}
      <div className="mt-5 space-y-3">
        {TIERS.map((tier, i) => (
          <div
            key={tier.key}
            className={`transition-all duration-500 motion-reduce:transition-none ${
              tierVisible(i)
                ? "max-h-40 translate-y-0 opacity-100"
                : "max-h-0 -translate-y-2 overflow-hidden opacity-0"
            }`}
          >
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {tier.label}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {tier.cidr} · 16,384 addresses
              </span>
            </div>
            <div className="flex h-9 w-full overflow-hidden rounded-md">
              {tier.children.map((c) => (
                <motion.div
                  key={c.cidr}
                  title={`${c.name} · ${c.cidr} · ${fmt(c.size)} addresses`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${(c.size / 16384) * 100}%`, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`group relative flex items-center justify-center border-r border-white/60 text-[10px] font-medium text-white last:border-r-0 dark:border-slate-900/40 ${c.tone}`}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="truncate px-1"
                  >
                    {c.name}
                  </motion.span>
                </motion.div>
              ))}
            </div>
            {tier.children[0].note && (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {tier.children[0].cidr} per AZ · {tier.children[0].note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Controls + caption */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setStep(0);
            setPlaying(true);
          }}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {playing ? "Playing…" : "Play the carve"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.min(5, s + 1));
          }}
          disabled={step === 5}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Next
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400">Step {step + 1} of 6</span>
      </div>

      <p className="mt-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 px-4 py-3 text-sm text-slate-700 dark:bg-blue-950/30 dark:text-slate-200">
        {CARVE_CAPTIONS[step]}
      </p>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   5. VPC PACKET FLOW
   Longest prefix match, animated.
   ══════════════════════════════════════════════════════════════════════ */

const ROUTES = [
  { dest: "10.0.0.0/16", target: "local", desc: "Every subnet in this VPC" },
  { dest: "10.1.0.0/16", target: "pcx-9f8e7d6c", desc: "Peered analytics VPC" },
  { dest: "172.20.0.0/16", target: "vgw-4d3c2b1a", desc: "On-prem over VPN" },
  { dest: "0.0.0.0/0", target: "nat-0a1b2c3d", desc: "Catch-all outbound" },
];

const DESTINATIONS = [
  {
    label: "RDS in this VPC",
    ip: "10.0.128.44",
    hops: ["EC2 · 10.0.64.19", "VPC router", "RDS · 10.0.128.44"],
    verdict:
      "Stays inside the VPC. The local route is the most specific match and can never be overridden.",
  },
  {
    label: "Peered VPC",
    ip: "10.1.4.20",
    hops: ["EC2 · 10.0.64.19", "VPC router", "Peering · pcx", "VPC 10.1.0.0/16"],
    verdict:
      "10.1.4.20 is not inside 10.0.0.0/16 at all. The /16 peering route beats the /0 default, so traffic crosses the peering link instead of the internet.",
  },
  {
    label: "Public internet",
    ip: "8.8.8.8",
    hops: ["EC2 · 10.0.64.19", "VPC router", "NAT GW · public", "Internet GW", "8.8.8.8"],
    verdict:
      "Nothing specific matches, so the 0.0.0.0/0 catch-all wins. The NAT gateway rewrites the source to its own public IP, which is why the return traffic finds its way back.",
  },
  {
    label: "On-prem host",
    ip: "172.20.9.5",
    hops: ["EC2 · 10.0.64.19", "VPC router", "Virtual GW", "On-prem 172.20.0.0/16"],
    verdict:
      "Matches the VPN route. If your on-prem network also used 10.0.0.0/16 this route could not exist, which is the whole argument for planning CIDRs org-wide.",
  },
];

export const VpcPacketFlow: React.FC = () => {
  const [destIdx, setDestIdx] = useState(0);
  const [hop, setHop] = useState(0);
  const dest = DESTINATIONS[destIdx];

  const winner = useMemo(() => {
    const ip = ipToInt(dest.ip);
    let best = -1;
    let bestPrefix = -1;
    ROUTES.forEach((r, i) => {
      const p = Number(r.dest.split("/")[1]);
      if (inCidr(ip, r.dest) && p > bestPrefix) {
        bestPrefix = p;
        best = i;
      }
    });
    return best;
  }, [dest]);

  useEffect(() => {
    setHop(0);
    const id = setInterval(() => {
      setHop((h) => (h + 1) % (dest.hops.length + 1));
    }, 900);
    return () => clearInterval(id);
  }, [destIdx, dest.hops.length]);

  return (
    <Panel
      label="Animated"
      title="Where does this packet go?"
      footnote="The VPC router compares the destination against every route and takes the longest prefix that matches. 0.0.0.0/0 always loses to anything else, which is exactly why it works as a catch-all."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.ip}
            onClick={() => setDestIdx(i)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              i === destIdx
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:text-slate-300"
            }`}
          >
            {d.label} <span className="font-mono opacity-70">{d.ip}</span>
          </button>
        ))}
      </div>

      {/* Route table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2 font-semibold">Destination</th>
              <th className="px-3 py-2 font-semibold">Target</th>
              <th className="px-3 py-2 font-semibold">Match</th>
            </tr>
          </thead>
          <tbody>
            {ROUTES.map((r, i) => {
              const matches = inCidr(ipToInt(dest.ip), r.dest);
              const isWinner = i === winner;
              return (
                <tr
                  key={r.dest}
                  className={`border-t border-slate-200 transition-colors duration-300 dark:border-slate-700 motion-reduce:transition-none ${
                    isWinner
                      ? "bg-emerald-50 dark:bg-emerald-950/40"
                      : matches
                        ? "bg-amber-50 dark:bg-amber-950/30"
                        : "opacity-50"
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs">{r.dest}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.target}</td>
                  <td className="px-3 py-2 text-xs">
                    {isWinner ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        ✓ longest prefix wins
                      </span>
                    ) : matches ? (
                      <span className="text-amber-700 dark:text-amber-400">
                        matches, but less specific
                      </span>
                    ) : (
                      <span className="text-slate-400">no match</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hop animation */}
      <div className="relative mt-5 rounded-lg bg-slate-900 px-4 py-6 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-2">
          {dest.hops.map((h, i) => (
            <React.Fragment key={h}>
              <motion.div
                animate={{
                  scale: hop === i ? 1.05 : 1,
                  borderColor: hop > i ? "#34d399" : hop === i ? "#3b82f6" : "#334155",
                  backgroundColor:
                    hop > i
                      ? "rgba(52, 211, 153, 0.15)"
                      : hop === i
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(30, 41, 59, 0.6)",
                  color: hop > i ? "#6ee7b7" : hop === i ? "#93c5fd" : "#94a3b8",
                }}
                transition={{ duration: 0.3 }}
                className="flex-1 rounded-md border px-2 py-2 text-center text-[11px] font-medium shadow-sm"
              >
                {h}
              </motion.div>
              {i < dest.hops.length - 1 && (
                <div className="relative h-[2px] w-8 shrink-0 bg-slate-700 overflow-hidden rounded-full">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: hop > i ? "100%" : hop === i ? "0%" : "-100%" }}
                    transition={{
                      duration: hop === i ? 0.9 : 0.2,
                      ease: "linear",
                    }}
                    className="absolute inset-y-0 w-full bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.6)]"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <p className="mt-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-slate-700 dark:bg-emerald-950/30 dark:text-slate-200">
        <span className="font-mono font-semibold">{dest.ip}</span> →{" "}
        <span className="font-mono font-semibold">
          {winner >= 0 ? ROUTES[winner].target : "dropped"}
        </span>
        . {dest.verdict}
      </p>
    </Panel>
  );
};

export default {
  CidrExplorer,
  SubnetMathSteps,
  ReservedIpsDiagram,
  VpcCarveDiagram,
  VpcPacketFlow,
};
