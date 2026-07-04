"use client";

/**
 * DockerRunUnderTheHood.tsx
 * ------------------------------------------------------------------
 * StackBlueprint lesson animation: what actually happens when you run
 * `docker run -d --name web -p 8080:80 nginx`.
 *
 * Left  : a live terminal that types commands and streams real output.
 * Right : the under-the-hood pipeline (CLI -> dockerd -> containerd ->
 *         shim -> runc -> kernel -> running), each stage lighting up
 *         in perfect sync with the terminal, including the registry
 *         pull and the status flow-back when the container starts.
 *
 * Zero dependencies beyond React. Drop into any Next.js / Vite app.
 * Respects prefers-reduced-motion. Includes play/pause, scrub, speed
 * and replay controls to match the StackBlueprint lesson pattern.
 * ------------------------------------------------------------------
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ================================================================== */
/*  Palette (matches the reference art)                                */
/* ================================================================== */

const C = {
  bg: "#07070c",
  panel: "#0c0c13",
  termBg: "#0a0a10",
  border: "#1d1d2b",
  text: "#d7dbe6",
  dim: "#8b93a7",
  faint: "#5b6172",
  green: "#4ade80",
  greenSoft: "rgba(74,222,128,0.12)",
  blue: "#3b82f6",
  cyan: "#38bdf8",
  orange: "#fb923c",
  amber: "#fbbf24",
  purple: "#a78bfa",
  red: "#ff5f57",
  yellow: "#febc2e",
  grn: "#28c840",
};

/* ================================================================== */
/*  Timeline (all times in ms at 1x speed)                             */
/* ================================================================== */

const T = {
  type1Start: 500, // docker run ...
  enter1: 2050,
  cliActive: 2050,
  daemonActive: 2600,
  unableLine: 2450,
  containerdActive: 3150,
  pullStart: 3350,
  layerStart: 3750,
  layerEnd: 5250, // progress bar completes
  digest: 5500,
  statusLine: 5850,
  repoLine: 6100,
  containerId: 6600,
  shimActive: 6950,
  runcActive: 7800,
  kernelActive: 8650,
  flowbackStart: 9500,
  flowbackEnd: 10600,
  startedActive: 10700,
  type2Start: 11400, // docker ps
  enter2: 12050,
  psOut: 12250,
  type3Start: 13300, // curl -I
  enter3: 14550,
  curlOut: 14750,
  type4Start: 16600, // docker logs web
  enter4: 17400,
  logsOut: 17600,
  done: 19600,
  total: 20400,
};

const CMD1 = "docker run -d --name web -p 8080:80 nginx";
const CMD2 = "docker ps";
const CMD3 = "curl -I http://localhost:8080";
const CMD4 = "docker logs web";

const CONTAINER_ID =
  "8b3c2c5d8e1a4f9e2b7c8d6a1e5f3b9c7a2d1e0f6b5c4a3d2e1f0a9b8c7d6e5f4";

/* ================================================================== */
/*  Terminal line model                                                */
/* ================================================================== */

type Seg = { text: string; color?: string };

type Line = {
  at: number;
  segs: Seg[];
  /** typewriter command line */
  typedCmd?: { text: string; start: number; end: number };
  /** animated pull progress bar */
  progress?: { start: number; end: number; layer: string };
  small?: boolean;
};

function cmdLine(start: number, end: number, text: string): Line {
  return { at: start, segs: [], typedCmd: { text, start, end } };
}

function out(at: number, text: string, color?: string): Line {
  return { at, segs: [{ text, color }] };
}

function buildLines(): Line[] {
  const L: Line[] = [];

  // $ docker run -d --name web -p 8080:80 nginx
  L.push(cmdLine(T.type1Start, T.enter1, CMD1));
  L.push(out(T.unableLine, "Unable to find image 'nginx:latest' locally", C.dim));
  L.push(out(T.pullStart, "latest: Pulling from library/nginx"));
  L.push({
    at: T.layerStart,
    segs: [],
    progress: { start: T.layerStart, end: T.layerEnd, layer: "afc163c2a36d" },
  });
  L.push(
    out(
      T.digest,
      "digest: sha256:98f0e8b5b6c06a8f3b7f6a7d2e8d4d8b0c8c0f2c7c8d0a7f6a5b4e3c2d1f0a9b",
      C.dim
    )
  );
  L.push(out(T.statusLine, "Status: Downloaded newer image for nginx:latest"));
  L.push(out(T.repoLine, "docker.io/library/nginx:latest", C.dim));
  L.push(out(T.containerId - 120, "\u00A0"));
  L.push(out(T.containerId, CONTAINER_ID, C.green));

  // $ docker ps
  L.push(out(T.type2Start - 150, "\u00A0"));
  L.push(cmdLine(T.type2Start, T.enter2, CMD2));
  L.push({
    at: T.psOut,
    small: true,
    segs: [
      {
        text:
          "CONTAINER ID   IMAGE   COMMAND                  CREATED         STATUS        PORTS                  NAMES",
        color: C.dim,
      },
    ],
  });
  L.push({
    at: T.psOut + 160,
    small: true,
    segs: [
      { text: "8b3c2c5d8e1a", color: C.text },
      { text: "   nginx   ", color: C.text },
      { text: '"/docker-entrypoint.…"', color: C.dim },
      { text: "   3 seconds ago   ", color: C.text },
      { text: "Up 2 seconds", color: C.green },
      { text: "  0.0.0.0:8080->80/tcp", color: C.cyan },
      { text: "   web", color: C.text },
    ],
  });

  // $ curl -I http://localhost:8080
  L.push(out(T.type3Start - 150, "\u00A0"));
  L.push(cmdLine(T.type3Start, T.enter3, CMD3));
  const curl: Array<[string, string?]> = [
    ["HTTP/1.1 200 OK", C.green],
    ["Server: nginx/1.25.3"],
    ["Date: Sun, 02 Jun 2024 12:00:00 GMT", C.dim],
    ["Content-Type: text/html"],
    ["Content-Length: 615", C.dim],
    ["Last-Modified: Tue, 30 Apr 2024 12:30:34 GMT", C.dim],
    ["Connection: keep-alive", C.dim],
    ['ETag: "6630c45a-267"', C.dim],
    ["Accept-Ranges: bytes", C.dim],
  ];
  curl.forEach(([text, color], i) =>
    L.push(out(T.curlOut + i * 110, text, color))
  );

  // $ docker logs web
  L.push(out(T.type4Start - 150, "\u00A0"));
  L.push(cmdLine(T.type4Start, T.enter4, CMD4));
  const logs: Array<[string, string?]> = [
    [
      "/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration",
      C.dim,
    ],
    ["/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/", C.dim],
    [
      "/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh",
      C.dim,
    ],
    ["10-listen-on-ipv6-by-default.sh: info: IPv6 listen already enabled", C.dim],
    [
      "/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh",
      C.dim,
    ],
    [
      "/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh",
      C.dim,
    ],
    ["/docker-entrypoint.sh: Configuration complete; ready for start up", C.text],
    ['2024/06/02 12:00:00 [notice] 1#1: using the "epoll" event method', C.dim],
    ["2024/06/02 12:00:00 [notice] 1#1: nginx/1.25.3", C.dim],
    ["2024/06/02 12:00:00 [notice] 1#1: OS: Linux 6.5.0-17-amd64", C.dim],
    ["2024/06/02 12:00:00 [notice] 1#1: start worker processes", C.text],
    ["2024/06/02 12:00:00 [notice] 1#1: start worker process 29", C.text],
  ];
  logs.forEach(([text, color], i) =>
    L.push(out(T.logsOut + i * 95, text, color))
  );

  return L;
}

const LINES = buildLines();

/* ================================================================== */
/*  Pipeline model                                                     */
/* ================================================================== */

type Stage = {
  id: string;
  at: number;
  title: string;
  suffix?: string;
  accent: string;
  body: React.ReactNode;
  icon: React.ReactNode;
};

const Icon = {
  cli: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="4 6 10 12 4 18" />
      <line x1="13" y1="18" x2="20" y2="18" />
    </svg>
  ),
  /** Official Docker whale (Simple Icons, CC0) */
  whale: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d={"M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"} />
    </svg>
  ),
  /** Official containerd logo (Simple Icons, CC0) */
  containerd: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d={"M3.629 0v24H20.37V0zM17.59 21.208H6.421V10.604h7.812V6.692h3.346v14.516zm-7.823-7.812h4.466v5.02H9.767z"} />
    </svg>
  ),
  /** No official logo exists for the shim — it's a plain helper process */
  cube: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  /** Official OCI logo (Simple Icons, CC0) — runc is the OCI reference runtime */
  runc: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d={"M0 0v24h24V0zm20.547 20.431H3.448V3.573h17.104V20.43zm-5.155-9.979h3.436v8.255h-3.436zm0-5.16h3.436v3.436h-3.436zm-6.789 9.976V8.732h5.074v-3.44H5.164v13.415h8.513v-3.44Z"} />
    </svg>
  ),
  /** Official Tux (Simple Icons, CC0) */
  kernel: (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden>
      <path d={"M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"} />
    </svg>
  ),
  registry: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 19z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9.5" />
    </svg>
  ),
};

const mono = (s: string, color: string) => (
  <code style={{ color, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.92em" }}>{s}</code>
);

const STAGES: Stage[] = [
  {
    id: "cli",
    at: T.cliActive,
    title: "1. Docker CLI",
    accent: C.blue,
    icon: Icon.cli,
    body: (
      <>
        You run: {mono("docker run -d -p 8080:80 nginx", C.green)}
        <br />
        The CLI sends a request to the Docker Daemon via the Docker API (Unix
        socket).
      </>
    ),
  },
  {
    id: "dockerd",
    at: T.daemonActive,
    title: "2. dockerd",
    suffix: "(Docker Daemon)",
    accent: C.cyan,
    icon: Icon.whale,
    body: (
      <>
        Receives the request, validates it, sets up networking (the{" "}
        {mono("-p 8080:80", C.green)} port mapping), and forwards it to
        containerd via gRPC.
      </>
    ),
  },
  {
    id: "containerd",
    at: T.containerdActive,
    title: "3. containerd",
    accent: C.orange,
    icon: Icon.containerd,
    body: (
      <>
        Checks for the image locally; pulls it from the Registry if missing.
        Its snapshotter then stacks the image layers with overlay2 and adds the
        container's writable layer on top.
      </>
    ),
  },
  {
    id: "shim",
    at: T.shimActive,
    title: "4. containerd-shim",
    accent: C.orange,
    icon: Icon.cube,
    body: (
      <>
        A dedicated shim process is created for this container. It will manage
        the container's stdin/stdout, signals and lifecycle.
      </>
    ),
  },
  {
    id: "runc",
    at: T.runcActive,
    title: "5. runc",
    suffix: "(OCI Runtime)",
    accent: C.purple,
    icon: Icon.runc,
    body: (
      <>
        The shim asks runc to create the container. runc sets up namespaces,
        cgroups and mounts via the Linux Kernel, starts the container process —
        then exits. The shim stays behind as the process's parent.
      </>
    ),
  },
  {
    id: "kernel",
    at: T.kernelActive,
    title: "6. Linux Kernel",
    accent: C.amber,
    icon: Icon.kernel,
    body: (
      <>
        Applies isolation (namespaces, cgroups, capabilities, seccomp,
        AppArmor/SELinux) and starts the container process.
      </>
    ),
  },
];

/* ================================================================== */
/*  Clock hook                                                         */
/* ================================================================== */

function useClock(total: number) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);
  const tRef = useRef(0);
  const playRef = useRef(true);
  const speedRef = useRef(1);

  tRef.current = t;
  playRef.current = playing;
  speedRef.current = speed;

  useEffect(() => {
    const tick = (now: number) => {
      if (!last.current) last.current = now;
      const dt = now - last.current;
      last.current = now;
      if (playRef.current && tRef.current < total) {
        const next = Math.min(total, tRef.current + dt * speedRef.current);
        tRef.current = next;
        setT(next);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [total]);

  const seek = useCallback((ms: number) => {
    tRef.current = ms;
    setT(ms);
  }, []);

  const restart = useCallback(() => {
    seek(0);
    setPlaying(true);
  }, [seek]);

  return { t, playing, setPlaying, speed, setSpeed, seek, restart };
}

/* ================================================================== */
/*  Small pieces                                                       */
/* ================================================================== */

function Cursor({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: "0.58em",
        height: "1.05em",
        background: C.green,
        verticalAlign: "text-bottom",
        marginLeft: 2,
        animation: "sbduh-blink 1.05s steps(1) infinite",
      }}
    />
  );
}

function ProgressLine({ t, p }: { t: number; p: NonNullable<Line["progress"]> }) {
  const done = t >= p.end;
  if (done) {
    return (
      <span>
        <span style={{ color: C.cyan }}>{p.layer}</span>
        <span style={{ color: C.text }}>: Pull complete</span>
      </span>
    );
  }
  const f = Math.min(1, Math.max(0, (t - p.start) / (p.end - p.start)));
  const width = 26;
  const filled = Math.round(f * width);
  const bar =
    "=".repeat(Math.max(0, filled - 1)) + (filled > 0 && filled < width ? ">" : filled >= width ? "=" : "");
  const mb = (f * 54.1).toFixed(1);
  return (
    <span>
      <span style={{ color: C.cyan }}>{p.layer}</span>
      <span style={{ color: C.dim }}>: Downloading  </span>
      <span style={{ color: C.faint }}>[</span>
      <span style={{ color: C.green }}>{bar.padEnd(width, " ")}</span>
      <span style={{ color: C.faint }}>]</span>
      <span style={{ color: C.dim }}>  {mb}MB/54.1MB</span>
    </span>
  );
}

/* ================================================================== */
/*  Terminal panel                                                     */
/* ================================================================== */

function Terminal({ t }: { t: number }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(() => LINES.filter((l) => t >= l.at), [t]);

  // Which command is currently mid-typing (cursor lives there)
  const typingLine = visible.find(
    (l) => l.typedCmd && t >= l.typedCmd.start && t < l.typedCmd.end + 250
  );
  const atRest = t >= T.done;

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible.length, typingLine ? Math.floor(t / 60) : 0]);

  return (
    <div
      style={{
        background: C.termBg,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {[C.red, C.yellow, C.grn].map((c) => (
          <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
        ))}
        <span
          style={{
            flex: 1,
            textAlign: "center",
            color: C.faint,
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            userSelect: "none",
            marginRight: 44,
          }}
        >
          Terminal — zsh — 80×24
        </span>
      </div>

      <div
        ref={bodyRef}
        style={{
          padding: "16px 18px 20px",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 13,
          lineHeight: 1.62,
          color: C.text,
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          minHeight: 0,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {visible.map((l, i) => {
          if (l.typedCmd) {
            const { text, start, end } = l.typedCmd;
            const f = Math.min(1, (t - start) / (end - start - 250));
            const shown = text.slice(0, Math.round(f * text.length));
            const isTyping = t < end + 250 && shown.length <= text.length;
            return (
              <div key={i}>
                <span style={{ color: C.green }}>$ </span>
                <span style={{ color: C.green, fontWeight: 600 }}>{shown}</span>
                <Cursor on={isTyping && !atRest} />
              </div>
            );
          }
          if (l.progress) {
            return (
              <div key={i}>
                <ProgressLine t={t} p={l.progress} />
              </div>
            );
          }
          return (
            <div key={i} style={{ fontSize: l.small ? 11 : 13 }}>
              {l.segs.map((s, j) => (
                <span key={j} style={{ color: s.color ?? C.text }}>
                  {s.text}
                </span>
              ))}
            </div>
          );
        })}
        {atRest && (
          <div>
            <span style={{ color: C.green }}>$ </span>
            <Cursor on />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Pipeline panel                                                     */
/* ================================================================== */

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function StageCard({
  stage,
  state,
  flowback,
}: {
  stage: Stage;
  state: "idle" | "active" | "done";
  flowback: boolean;
}) {
  const lit = state !== "idle";
  const accent = stage.accent;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid ${lit ? hexA(accent, state === "active" ? 0.9 : 0.45) : C.border}`,
        background: lit ? hexA(accent, 0.06) : "rgba(255,255,255,0.015)",
        boxShadow:
          state === "active"
            ? `0 0 0 1px ${hexA(accent, 0.35)}, 0 0 26px ${hexA(accent, 0.22)}`
            : "none",
        opacity: lit ? 1 : 0.42,
        transform: state === "active" ? "scale(1.015)" : "scale(1)",
        transition:
          "opacity .45s ease, border-color .45s ease, box-shadow .45s ease, transform .45s cubic-bezier(.2,.9,.3,1.2), background .45s ease",
        animation:
          state === "active" && !flowback ? "sbduh-cardpulse 1.6s ease-in-out infinite" : "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 9,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          color: lit ? accent : C.faint,
          background: lit ? hexA(accent, 0.12) : "rgba(255,255,255,0.03)",
          border: `1px solid ${lit ? hexA(accent, 0.35) : C.border}`,
          transition: "all .45s ease",
        }}
      >
        {stage.icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: lit ? "#eef1f8" : C.dim }}>
          {stage.title}{" "}
          {stage.suffix && (
            <span style={{ fontWeight: 500, color: C.dim, fontSize: 12 }}>{stage.suffix}</span>
          )}
        </div>
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: lit ? C.dim : C.faint, marginTop: 2 }}>
          {stage.body}
        </div>
      </div>
      {state === "done" && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            color: hexA(accent, 0.9),
            fontSize: 11,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          ✓
        </span>
      )}
    </div>
  );
}

function Connector({
  lit,
  color,
  pulsing,
  flowUp,
}: {
  lit: boolean;
  color: string;
  pulsing: boolean;
  flowUp: boolean;
}) {
  const c = flowUp ? C.green : color;
  return (
    <div style={{ display: "flex", justifyContent: "center", height: 22, position: "relative" }}>
      <div
        style={{
          width: 2,
          height: "100%",
          background: lit || flowUp ? hexA(c, 0.75) : C.border,
          transition: "background .4s ease",
          position: "relative",
          overflow: "visible",
        }}
      >
        {(pulsing || flowUp) && (
          <span
            style={{
              position: "absolute",
              left: -2,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 8px ${c}`,
              animation: `${flowUp ? "sbduh-dotup" : "sbduh-dotdown"} .8s linear infinite`,
            }}
          />
        )}
      </div>
      <span
        style={{
          position: "absolute",
          bottom: -1,
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `5px solid ${lit || flowUp ? hexA(c, 0.85) : C.border}`,
          transition: "border-color .4s ease",
          transform: flowUp ? "rotate(180deg) translateY(16px)" : "none",
        }}
      />
    </div>
  );
}

function Pipeline({ t }: { t: number }) {
  const activeIdx = STAGES.reduce((acc, s, i) => (t >= s.at ? i : acc), -1);
  const pulling = t >= T.containerdActive && t < T.containerId;
  const flowback = t >= T.flowbackStart && t < T.startedActive;
  const started = t >= T.startedActive;
  const running = t >= T.startedActive;

  // during flowback, connectors light green bottom-to-top
  const fbSlice = (T.flowbackEnd - T.flowbackStart) / STAGES.length;
  const fbIdx = flowback ? Math.floor((t - T.flowbackStart) / fbSlice) : -1;

  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "16px 16px 18px",
        display: "flex",
        flexDirection: "column",
        minWidth: 480,
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: 800,
          letterSpacing: "0.06em",
          fontSize: 14,
          color: "#f1f3fa",
          marginBottom: 14,
        }}
      >
        WHAT HAPPENS UNDER THE HOOD
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "stretch", minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {STAGES.map((s, i) => {
            const state: "idle" | "active" | "done" =
              t < s.at ? "idle" : i === activeIdx && !started ? "active" : "done";
            const connLit = activeIdx > i;
            const connPulse = activeIdx === i && t < STAGES[i + 1]?.at;
            const connFlowUp = flowback && STAGES.length - 1 - fbIdx === i + 1;
            return (
              <React.Fragment key={s.id}>
                <StageCard stage={s} state={running ? "done" : state} flowback={flowback} />
                {i < STAGES.length - 1 && (
                  <Connector
                    lit={connLit}
                    color={STAGES[i + 1].accent}
                    pulsing={!!connPulse && !started}
                    flowUp={connFlowUp}
                  />
                )}
              </React.Fragment>
            );
          })}

          <Connector lit={t >= T.startedActive - 250} color={C.green} pulsing={flowback} flowUp={false} />

          {/* Container Started */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${started ? hexA(C.green, 0.7) : C.border}`,
              background: started ? C.greenSoft : "rgba(255,255,255,0.015)",
              boxShadow: started ? `0 0 26px ${hexA(C.green, 0.18)}` : "none",
              opacity: started ? 1 : 0.42,
              transition: "all .5s ease",
              animation: started && t < T.done ? "sbduh-startglow 2s ease-in-out infinite" : "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 9,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                color: started ? C.green : C.faint,
                background: started ? hexA(C.green, 0.12) : "rgba(255,255,255,0.03)",
                border: `1px solid ${started ? hexA(C.green, 0.35) : C.border}`,
                transition: "all .5s ease",
              }}
            >
              {Icon.check}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: started ? C.green : C.dim }}>
                Container Started ✓
              </div>
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: started ? C.dim : C.faint, marginTop: 2 }}>
                Status flows back: shim → containerd → dockerd → CLI. The container is now running.
              </div>
            </div>
          </div>
        </div>

        {/* Registry side card */}
        <div style={{ width: 128, flexShrink: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ height: 158 }} />
          <div
            style={{
              border: `1px solid ${pulling ? hexA(C.purple, 0.8) : C.border}`,
              background: pulling ? hexA(C.purple, 0.07) : "rgba(255,255,255,0.015)",
              boxShadow: pulling ? `0 0 22px ${hexA(C.purple, 0.22)}` : "none",
              borderRadius: 12,
              padding: "12px 12px",
              opacity: pulling || t >= T.containerdActive ? 1 : 0.42,
              transition: "all .45s ease",
              textAlign: "left",
            }}
          >
            <div style={{ color: pulling ? C.purple : C.faint, marginBottom: 6, transition: "color .4s" }}>
              {Icon.registry}
            </div>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: pulling ? "#eef1f8" : C.dim }}>
              Registry
            </div>
            <div style={{ fontSize: 10.5, color: C.dim }}>(Docker Hub)</div>
            <div style={{ fontSize: 10.5, lineHeight: 1.45, color: C.faint, marginTop: 6 }}>
              Sends the requested image layers
            </div>
          </div>
          {/* dashed arrows to/from containerd */}
          <svg
            width="30"
            height="46"
            viewBox="0 0 30 46"
            style={{ position: "absolute", left: -26, top: 168, overflow: "visible" }}
          >
            <defs>
              <marker id="sbduh-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" fill={pulling ? C.purple : C.border} />
              </marker>
            </defs>
            <line
              x1="2" y1="12" x2="27" y2="12"
              stroke={pulling ? C.purple : C.border}
              strokeWidth="1.6"
              strokeDasharray="4 4"
              markerEnd="url(#sbduh-arr)"
              style={pulling ? { animation: "sbduh-dash 0.7s linear infinite" } : undefined}
            />
            <line
              x1="27" y1="34" x2="2" y2="34"
              stroke={pulling ? C.purple : C.border}
              strokeWidth="1.6"
              strokeDasharray="4 4"
              markerEnd="url(#sbduh-arr)"
              style={pulling ? { animation: "sbduh-dash 0.7s linear infinite" } : undefined}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Controls (StackBlueprint "you drive it" pattern)                    */
/* ================================================================== */

const PHASES: Array<[number, string]> = [
  [0, "Typing the command"],
  [T.cliActive, "CLI → API request"],
  [T.daemonActive, "dockerd validates"],
  [T.containerdActive, "containerd pulls image"],
  [T.shimActive, "shim spawned"],
  [T.runcActive, "runc creates container"],
  [T.kernelActive, "kernel isolates & starts"],
  [T.flowbackStart, "status flows back"],
  [T.startedActive, "container running"],
  [T.type2Start, "verify: docker ps"],
  [T.type3Start, "verify: curl"],
  [T.type4Start, "inspect: docker logs"],
  [T.done, "done — replay anytime"],
];

function Controls({
  t,
  playing,
  speed,
  onPlay,
  onSeek,
  onSpeed,
  onRestart,
}: {
  t: number;
  playing: boolean;
  speed: number;
  onPlay: () => void;
  onSeek: (ms: number) => void;
  onSpeed: () => void;
  onRestart: () => void;
}) {
  const phase = PHASES.reduce((acc, [at, label]) => (t >= at ? label : acc), PHASES[0][1]);
  const btn: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${C.border}`,
    color: C.text,
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    fontWeight: 600,
    lineHeight: 1,
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        background: C.panel,
        flexWrap: "wrap",
      }}
    >
      <button style={btn} onClick={onRestart} aria-label="Replay">
        ↺ Replay
      </button>
      <button style={{ ...btn, minWidth: 74 }} onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>
        {playing ? "❚❚ Pause" : "▶ Play"}
      </button>
      <button style={btn} onClick={onSpeed} aria-label="Playback speed">
        {speed}×
      </button>
      <input
        type="range"
        min={0}
        max={T.total}
        value={t}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Scrub timeline"
        style={{ flex: 1, minWidth: 140, accentColor: C.green, cursor: "pointer" }}
      />
      <span
        style={{
          fontSize: 11.5,
          color: C.dim,
          fontFamily: "ui-monospace, monospace",
          minWidth: 170,
          textAlign: "right",
        }}
      >
        {phase}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */

const KEYFRAMES = `
@keyframes sbduh-blink { 0%, 55% { opacity: 1 } 56%, 100% { opacity: 0 } }
@keyframes sbduh-cardpulse {
  0%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 0 20px rgba(255,255,255,0.04) }
  50% { box-shadow: 0 0 0 1px rgba(255,255,255,0.10), 0 0 30px rgba(255,255,255,0.08) }
}
@keyframes sbduh-startglow {
  0%, 100% { box-shadow: 0 0 18px rgba(74,222,128,0.12) }
  50% { box-shadow: 0 0 34px rgba(74,222,128,0.28) }
}
@keyframes sbduh-dotdown { from { top: -4px } to { top: 100% } }
@keyframes sbduh-dotup { from { top: 100% } to { top: -4px } }
@keyframes sbduh-dash { to { stroke-dashoffset: -8 } }
@media (prefers-reduced-motion: reduce) {
  .sbduh-root * { animation: none !important; transition-duration: 0.01ms !important; }
}
@media (max-width: 900px) {
  .sbduh-grid { grid-template-columns: 1fr !important; }
  .sbduh-term { min-height: 380px !important; max-height: 440px !important; }
}
`;

export default function DockerRunUnderTheHood() {
  const { t, playing, setPlaying, speed, setSpeed, seek, restart } = useClock(T.total);

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => (s === 0.5 ? 1 : s === 1 ? 1.5 : s === 1.5 ? 2 : 0.5));
  }, [setSpeed]);

  return (
    <div
      className="sbduh-root"
      style={{
        background: C.bg,
        borderRadius: 18,
        padding: 16,
        color: C.text,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        border: `1px solid ${C.border}`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        className="sbduh-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        <div
          className="sbduh-term"
          style={{ display: "flex", flexDirection: "column", minHeight: 560, minWidth: 0 }}
        >
          <Terminal t={t} />
        </div>
        <div style={{ overflowX: "auto", display: "flex", flex: 1, minWidth: 0 }}>
          <Pipeline t={t} />
        </div>
      </div>

      <Controls
        t={t}
        playing={playing}
        speed={speed}
        onPlay={() => setPlaying((p) => !p)}
        onSeek={seek}
        onSpeed={cycleSpeed}
        onRestart={restart}
      />
    </div>
  );
}
