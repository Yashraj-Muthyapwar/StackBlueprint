import { motion } from "motion/react";

function Field({
  width,
  color,
  title,
  bits,
  value,
  tooltip,
}: {
  width: string;
  color: "blue" | "emerald" | "amber" | "purple" | "rose" | "cyan" | "slate";
  title: string;
  bits: string;
  value: string;
  tooltip: string;
}) {
  const bgClasses = {
    blue: "bg-blue-50/60 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50",
    emerald:
      "bg-emerald-50/60 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50",
    amber: "bg-amber-50/60 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50",
    purple: "bg-purple-50/60 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50",
    rose: "bg-rose-50/60 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50",
    cyan: "bg-cyan-50/60 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50",
    slate: "bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70",
  }[color];

  const textClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    purple: "text-purple-600 dark:text-purple-400",
    rose: "text-rose-600 dark:text-rose-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    slate: "text-slate-600 dark:text-slate-400",
  }[color];

  return (
    <div
      style={{ width }}
      className={`group flex cursor-default flex-col items-center justify-center border-b border-r border-hairline p-3 text-center transition-colors last:border-r-0 ${bgClasses}`}
      title={tooltip}
    >
      <span className="font-semibold text-slate-800 dark:text-slate-200">{title}</span>
      <span className="mt-0.5 font-mono text-[9px] text-slate-500 dark:text-slate-400">{bits}</span>
      <span className={`mt-1 font-mono text-[11px] font-medium ${textClasses}`}>{value}</span>
    </div>
  );
}

export function IPv4Diagram() {
  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <figcaption className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
        <span>IPv4 Packet Header Format</span>
        <span className="text-[9px] opacity-70">Example: HTTP Request</span>
      </figcaption>

      <div className="overflow-x-auto p-4 md:p-8">
        <div className="min-w-[700px] font-sans text-xs">
          {/* Header Row indicating 32 bits */}
          <div className="mb-2 flex justify-between px-1 font-mono text-[10px] text-muted-foreground">
            <span>0</span>
            <span>4</span>
            <span>8</span>
            <span>16</span>
            <span>19</span>
            <span>24</span>
            <span>31</span>
          </div>

          <div className="flex flex-col overflow-hidden rounded-[4px] border-l border-t border-hairline bg-surface shadow-sm">
            {/* ROW 1 */}
            <div className="flex w-full">
              <Field
                width="12.5%"
                color="blue"
                title="Version"
                bits="4 bits"
                value="4 (IPv4)"
                tooltip="Version (4 bits)"
              />
              <Field
                width="12.5%"
                color="blue"
                title="IHL"
                bits="4 bits"
                value="20 bytes"
                tooltip="Internet Header Length (4 bits)"
              />
              <Field
                width="25%"
                color="amber"
                title="Type of Service"
                bits="8 bits"
                value="0 (Standard)"
                tooltip="Quality of Service / DSCP (8 bits)"
              />
              <Field
                width="50%"
                color="blue"
                title="Total Length"
                bits="16 bits"
                value="60 bytes"
                tooltip="Total Length (16 bits)"
              />
            </div>

            {/* ROW 2 */}
            <div className="flex w-full">
              <Field
                width="50%"
                color="purple"
                title="Identification"
                bits="16 bits"
                value="0x1a2b"
                tooltip="Identification (16 bits)"
              />
              <Field
                width="9.375%"
                color="purple"
                title="Flags"
                bits="3 bits"
                value="DF"
                tooltip="Flags: Don't Fragment (3 bits)"
              />
              <Field
                width="40.625%"
                color="purple"
                title="Fragment Offset"
                bits="13 bits"
                value="0"
                tooltip="Fragment Offset (13 bits)"
              />
            </div>

            {/* ROW 3 */}
            <div className="flex w-full">
              <Field
                width="25%"
                color="rose"
                title="Time to Live"
                bits="8 bits"
                value="64 hops"
                tooltip="Time to Live (8 bits)"
              />
              <Field
                width="25%"
                color="cyan"
                title="Protocol"
                bits="8 bits"
                value="TCP (6)"
                tooltip="Protocol (8 bits)"
              />
              <Field
                width="50%"
                color="emerald"
                title="Header Checksum"
                bits="16 bits"
                value="0x8a91"
                tooltip="Header Checksum (16 bits)"
              />
            </div>

            {/* ROW 4 */}
            <div className="flex w-full">
              <Field
                width="100%"
                color="slate"
                title="Source IP Address"
                bits="32 bits"
                value="192.168.1.5"
                tooltip="Source IP Address (32 bits)"
              />
            </div>

            {/* ROW 5 */}
            <div className="flex w-full">
              <Field
                width="100%"
                color="slate"
                title="Destination IP Address"
                bits="32 bits"
                value="142.250.190.46"
                tooltip="Destination IP Address (32 bits)"
              />
            </div>

            {/* ROW 6 */}
            <div className="flex w-full [&>div]:border-b-0">
              <Field
                width="75%"
                color="slate"
                title="Options"
                bits="Variable"
                value="None"
                tooltip="Options (variable)"
              />
              <Field
                width="25%"
                color="slate"
                title="Padding"
                bits="Variable"
                value="None"
                tooltip="Padding (variable)"
              />
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
