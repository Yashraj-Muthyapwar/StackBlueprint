import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileKey,
  Fingerprint,
  KeyRound,
  Laptop,
  Lock,
  LockKeyhole,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Server,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type PhaseId =
  | "connect"
  | "negotiate"
  | "kex"
  | "verify-server"
  | "encrypt"
  | "verify-user"
  | "session";
type ChipId =
  | "client.private"
  | "client.known"
  | "client.session"
  | "server.host"
  | "server.authorized"
  | "server.session";
type ScenarioId = "normal" | "password" | "host-changed" | "unauthorized";
type TermLine = { k: "cmd" | "out" | "warn"; t: string };

type StepDef = {
  phase: PhaseId;
  title: string;
  /** A packet goes between the machines. A local step happens inside one machine. */
  kind: "packet" | "local";
  dir?: "c2s" | "s2c" | "both";
  side?: "client" | "server" | "both";
  /** Label on the envelope (packets) or on the machine (local steps). Keep it under 24 characters. */
  label: string;
  /** plain = readable on the wire, cipher = encrypted on the wire, local = never on the wire. */
  vis: "plain" | "cipher" | "local";
  /** What an eavesdropper reads for plain packets. */
  wire?: string;
  /** What the receiver reads after decryption, or what the machine calculates. */
  endpoint: string;
  explain: string;
  why?: string;
  uses?: ChipId[];
  derives?: boolean;
  newkeys?: boolean;
  bad?: boolean;
  chipNote?: Partial<Record<ChipId, string>>;
  term?: TermLine[];
  /** Shortened `ssh -v` output for this step. */
  vlog?: string[];
};

const PHASES: { id: PhaseId; label: string }[] = [
  { id: "connect", label: "Connect" },
  { id: "negotiate", label: "Negotiate" },
  { id: "kex", label: "Exchange keys" },
  { id: "verify-server", label: "Check server" },
  { id: "encrypt", label: "Encrypt" },
  { id: "verify-user", label: "Log in" },
  { id: "session", label: "Open session" },
];

const SCENARIOS: { id: ScenarioId; label: string; hint: string }[] = [
  { id: "normal", label: "Key login", hint: "All checks pass" },
  {
    id: "password",
    label: "Password login",
    hint: "The password goes through the encrypted connection",
  },
  {
    id: "host-changed",
    label: "Host key changed",
    hint: "The host key is not the same as the key in known_hosts",
  },
  {
    id: "unauthorized",
    label: "Key not authorized",
    hint: "The server does not know your public key",
  },
];

const BASE_STEPS: StepDef[] = [
  {
    phase: "connect",
    title: "Open a TCP connection",
    kind: "packet",
    dir: "both",
    label: "TCP handshake (port 22)",
    vis: "plain",
    wire: "SYN →\n← SYN-ACK\nACK →",
    endpoint: "The TCP connection to port 22 is open. SSH has not started.",
    explain:
      "The client opens a TCP connection to port 22 on the server. All TCP services use the same three-step handshake.",
    why: "SSH uses TCP. The two sides need a reliable connection before they send SSH data.",
    term: [{ k: "cmd", t: "$ ssh -i ssh-key-2026-06-14.key ubuntu@192.168.1.20" }],
  },
  {
    phase: "connect",
    title: "Send the version strings",
    kind: "packet",
    dir: "both",
    label: "SSH version strings",
    vis: "plain",
    wire: "SSH-2.0-OpenSSH_9.6\nSSH-2.0-OpenSSH_9.6 Ubuntu",
    endpoint: "Both sides know that the other side uses SSH-2.",
    explain: "Each side sends the version of SSH and the name of its software.",
    why: "The text is plain on purpose. Both sides must agree on the protocol first.",
  },
  {
    phase: "negotiate",
    title: "Choose the algorithms",
    kind: "packet",
    dir: "both",
    label: "Algorithm lists",
    vis: "plain",
    wire: "kex: curve25519-sha256\nhost key: ssh-ed25519\ncipher: chacha20-poly1305",
    endpoint:
      "Result: curve25519 for key exchange, ed25519 for the host key, ChaCha20-Poly1305 for encryption.",
    explain:
      "Each side sends a list of the algorithms it supports, in order of preference. Both sides use the first algorithm that is in both lists.",
    why: "Old and new software can work together. They use the best method that both know.",
  },
  {
    phase: "kex",
    title: "Start the key exchange",
    kind: "packet",
    dir: "c2s",
    label: "Key exchange (ECDH)",
    vis: "plain",
    wire: "client public value:\n8f 2c 91 d4 0a 6e …\n(temporary value, safe to publish)",
    endpoint: "The server has the temporary public value of the client.",
    explain:
      "The client sends a temporary public value. The server sends its own value in the next step. Each side combines its own secret with the public value of the other side.",
    why: "Both sides get the same shared secret. The shared secret does not go across the network. An eavesdropper sees the public values but cannot find the secret.",
  },
  {
    phase: "verify-server",
    title: "Prove the server identity",
    kind: "packet",
    dir: "s2c",
    label: "Host key + signature",
    vis: "plain",
    wire: "server public value: 3b 77 e0 18 …\nhost key: ssh-ed25519 SHA256:xK3Q…\nsignature: a4 19 7c 5e …",
    endpoint: "The client has the host public key and the signature of the server.",
    explain:
      "The server sends its own temporary public value, its host public key, and a signature. The server makes the signature with its host private key.",
    why: "Only the real server has the host private key. Only the real server can make this signature.",
    uses: ["server.host"],
  },
  {
    phase: "verify-server",
    title: "Check the server",
    kind: "local",
    side: "client",
    label: "Check known_hosts",
    vis: "local",
    endpoint:
      "The signature is valid ✓\nSHA256:xK3Q… is the same as the key in ~/.ssh/known_hosts ✓",
    explain:
      "The client checks the signature. Then it compares the host key with the entry in ~/.ssh/known_hosts. At the first connection, SSH asks if you trust the key. Then it saves the key.",
    why: "This check shows that you reached the correct server. It stops an attacker who is in the middle.",
    uses: ["client.known", "server.host"],
  },
  {
    phase: "encrypt",
    title: "Make the session keys",
    kind: "local",
    side: "both",
    label: "Make session keys",
    vis: "local",
    derives: true,
    endpoint: "The client and the server each make the same session keys. They send nothing.",
    explain:
      "Both sides combine the shared secret with the exchange hash. Both sides make the same session keys.",
    why: "Each side calculates the keys alone. Nothing goes across the network that an attacker can copy.",
    uses: ["client.session", "server.session"],
  },
  {
    phase: "encrypt",
    title: "Turn on encryption",
    kind: "packet",
    dir: "both",
    label: "NEWKEYS",
    vis: "plain",
    newkeys: true,
    wire: "SSH_MSG_NEWKEYS",
    endpoint: "All data after this packet is encrypted and has an integrity check.",
    explain: "Each side sends NEWKEYS. This message means: use the new session keys from now.",
    why: "This is the last readable packet. After it, an eavesdropper sees only ciphertext.",
    uses: ["client.session", "server.session"],
  },
  {
    phase: "verify-user",
    title: "Start user login",
    kind: "packet",
    dir: "c2s",
    label: "Request ssh-userauth",
    vis: "cipher",
    endpoint: 'SSH_MSG_SERVICE_REQUEST\nservice: "ssh-userauth"',
    explain: "The client asks to start user login. The request goes through the encrypted connection.",
    uses: ["client.session"],
  },
  {
    phase: "verify-user",
    title: "Offer the public key",
    kind: "packet",
    dir: "c2s",
    label: "Offer public key",
    vis: "cipher",
    endpoint: "user: ubuntu\nmethod: publickey\nkey: ssh-ed25519 AAAAC3Nza…",
    explain: "The client sends the user name and the public key of its key pair.",
    why: "The message has only the public key. It does not have the private key.",
    uses: ["client.private"],
  },
  {
    phase: "verify-user",
    title: "Check authorized_keys",
    kind: "local",
    side: "server",
    label: "Check authorized_keys",
    vis: "local",
    endpoint:
      "The key is in /home/ubuntu/.ssh/authorized_keys ✓\nNext: the server needs proof of the private key.",
    explain: "The server looks for the public key in the authorized_keys file of the user.",
    why: "Anyone can copy a public key. The server must also get proof of the private key.",
    uses: ["server.authorized"],
  },
  {
    phase: "verify-user",
    title: "Sign with the private key",
    kind: "local",
    side: "client",
    label: "Sign with private key",
    vis: "local",
    endpoint:
      "signature = Sign(private key, session ID + request)\nThe private key stays on this machine.",
    explain: "The client signs a message with its private key. The message includes the session ID.",
    why: "The session ID is in the signed message. The signature does not work on any other connection.",
    uses: ["client.private"],
  },
  {
    phase: "verify-user",
    title: "Send the signature",
    kind: "packet",
    dir: "c2s",
    label: "Send signature",
    vis: "cipher",
    endpoint: "signature: 4f 9a c3 71 …  (64 bytes)",
    explain: "Only the signature goes across the network. The private key stays on the client.",
    uses: ["client.session"],
  },
  {
    phase: "verify-user",
    title: "Check the signature",
    kind: "local",
    side: "server",
    label: "Check signature",
    vis: "local",
    endpoint: "The signature matches the public key in authorized_keys ✓",
    explain: "The server checks the signature with the public key from authorized_keys.",
    why: "Only the matching private key can make a valid signature. The user is the correct user.",
    uses: ["server.authorized"],
  },
  {
    phase: "verify-user",
    title: "Accept the login",
    kind: "packet",
    dir: "s2c",
    label: "Authentication success",
    vis: "cipher",
    endpoint: "SSH_MSG_USERAUTH_SUCCESS",
    explain:
      "The server accepts the user. Now both identities are proved: the server with its host key and the user with the key pair.",
    uses: ["server.session"],
  },
  {
    phase: "session",
    title: "Open a session channel",
    kind: "packet",
    dir: "c2s",
    label: "Open session channel",
    vis: "cipher",
    endpoint: "SSH_MSG_CHANNEL_OPEN: session\nrequest: shell",
    explain: "The client opens a session channel. It asks for a shell.",
    uses: ["client.session"],
    term: [{ k: "out", t: "Welcome to Ubuntu 24.04 LTS" }],
  },
  {
    phase: "session",
    title: "Send an encrypted command",
    kind: "packet",
    dir: "c2s",
    label: "Encrypted command",
    vis: "cipher",
    endpoint: "cat application.log",
    explain: "The client encrypts the command with the session key. It adds an integrity check.",
    why: "If an attacker changes one bit, the check fails. The attacker cannot change cat fileA to cat fileB without detection.",
    uses: ["client.session"],
    term: [{ k: "cmd", t: "ubuntu@server:~$ cat application.log" }],
  },
  {
    phase: "session",
    title: "Run the command",
    kind: "local",
    side: "server",
    label: "Decrypt + run command",
    vis: "local",
    endpoint: "The integrity check is correct ✓\nThe command after decryption:\ncat application.log",
    explain:
      "The server checks the integrity check. It decrypts the command with the session key. Then it runs the command.",
    uses: ["server.session"],
  },
  {
    phase: "session",
    title: "Send the encrypted result",
    kind: "packet",
    dir: "s2c",
    label: "Encrypted result",
    vis: "cipher",
    endpoint:
      "2026-06-14 10:02:11 INFO service started\n2026-06-14 10:02:12 INFO listening on :8080",
    explain: "The output goes back the same way. It is encrypted and has an integrity check.",
    uses: ["server.session"],
  },
  {
    phase: "session",
    title: "Show the result",
    kind: "local",
    side: "client",
    label: "Decrypt result",
    vis: "local",
    endpoint: "The client decrypts the output with the session key. Your terminal shows it.",
    explain: "The client decrypts the output. It shows the output in your terminal.",
    uses: ["client.session"],
    term: [
      { k: "out", t: "2026-06-14 10:02:11 INFO service started" },
      { k: "out", t: "2026-06-14 10:02:12 INFO listening on :8080" },
    ],
  },
];

/** Shortened `ssh -v` lines, keyed by step title. Real output has more lines. */
const VLOG: Record<string, string[]> = {
  "Open a TCP connection": [
    "debug1: Connecting to 192.168.1.20 port 22.",
    "debug1: Connection established.",
  ],
  "Send the version strings": [
    "debug1: Remote protocol version 2.0, remote software version OpenSSH_9.6p1",
  ],
  "Choose the algorithms": [
    "debug1: SSH2_MSG_KEXINIT sent",
    "debug1: SSH2_MSG_KEXINIT received",
    "debug1: kex: algorithm: curve25519-sha256",
    "debug1: kex: host key algorithm: ssh-ed25519",
    "debug1: kex: cipher: chacha20-poly1305@openssh.com",
  ],
  "Start the key exchange": ["debug1: expecting SSH2_MSG_KEX_ECDH_REPLY"],
  "Prove the server identity": [
    "debug1: SSH2_MSG_KEX_ECDH_REPLY received",
    "debug1: Server host key: ssh-ed25519 SHA256:xK3Q...",
  ],
  "Check the server": [
    "debug1: Host '192.168.1.20' is known and matches the ED25519 host key.",
  ],
  "Turn on encryption": [
    "debug1: SSH2_MSG_NEWKEYS sent",
    "debug1: SSH2_MSG_NEWKEYS received",
  ],
  "Start user login": [
    "debug1: SSH2_MSG_SERVICE_ACCEPT received",
    "debug1: Authentications that can continue: publickey,password",
  ],
  "Offer the public key": [
    "debug1: Next authentication method: publickey",
    "debug1: Offering public key: ssh-key-2026-06-14.key ED25519",
  ],
  "Check authorized_keys": [
    "debug1: Server accepts key: ssh-key-2026-06-14.key ED25519",
  ],
  "Accept the login": ['Authenticated to 192.168.1.20 ([192.168.1.20]:22) using "publickey".'],
  "Open a session channel": [
    "debug1: channel 0: new session [client-session]",
    "debug1: Entering interactive session.",
  ],
  "The host key is different": [
    "@@@ WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED! @@@",
    "debug1: Host key fingerprint is SHA256:zQ9L...",
    "Host key verification failed.",
  ],
  "The key is not authorized": [
    "debug1: Offering public key: ssh-key-2026-06-14.key ED25519",
    "debug1: Authentications that can continue: publickey",
  ],
  "Reject the login": ["ubuntu@192.168.1.20: Permission denied (publickey)."],
  "Send the password": [
    "debug1: Next authentication method: password",
    "debug1: Authentications that can continue: publickey,password",
  ],
};

/** Adds the ssh -v lines to every step, so the data above stays easy to read. */
function buildSteps(scenario: ScenarioId): StepDef[] {
  return buildStepsRaw(scenario).map((s) => {
    // The shared success line names the method. The password flow needs its own line.
    if (scenario === "password" && s.title === "Accept the login") {
      return { ...s, vlog: ['Authenticated to 192.168.1.20 ([192.168.1.20]:22) using "password".'] };
    }
    return { ...s, vlog: s.vlog ?? VLOG[s.title] };
  });
}

/** Builds the step list for a scenario. A failure scenario stops where the real connection stops. */
function buildStepsRaw(scenario: ScenarioId): StepDef[] {
  if (scenario === "password") {
    return [
      ...BASE_STEPS.slice(0, 9),
      {
        phase: "verify-user",
        title: "Send the password",
        kind: "packet",
        dir: "c2s",
        label: "Send password",
        vis: "cipher",
        endpoint: "user: ubuntu\nmethod: password\npassword: ••••••••••",
        explain:
          "The client sends the user name and the password through the encrypted connection.",
        why: "An eavesdropper sees only ciphertext. But the server gets the real password. You must be sure that it is the correct server. For this reason, SSH checks the server first.",
        uses: ["client.session"],
        term: [{ k: "out", t: "ubuntu@192.168.1.20's password:" }],
      },
      {
        phase: "verify-user",
        title: "Check the password",
        kind: "local",
        side: "server",
        label: "Check password hash",
        vis: "local",
        endpoint: "The hash matches the entry in /etc/shadow ✓",
        explain:
          "The server calculates the hash of the password. It compares the hash with the stored hash. The server does not keep the plain password.",
        why: "Attackers can guess passwords. Bots try passwords on port 22 all day. Many teams use keys only.",
        uses: ["server.session"],
      },
      ...BASE_STEPS.slice(14),
    ];
  }
  if (scenario === "host-changed") {
    return [
      ...BASE_STEPS.slice(0, 5),
      {
        phase: "verify-server",
        title: "The host key is different",
        kind: "local",
        side: "client",
        label: "KEY MISMATCH",
        vis: "local",
        bad: true,
        endpoint: "known_hosts has:  SHA256:xK3Q…\nserver sent:      SHA256:zQ9L…",
        explain:
          "The server sends a host key that is not the same as the key in known_hosts. SSH shows a warning and closes the connection.",
        why: "Cause 1: someone rebuilt the server. Cause 2: an attacker pretends to be the server. Find the cause before you continue.",
        uses: ["client.known", "server.host"],
        chipNote: { "client.known": "saved: SHA256:xK3Q…\nreceived: SHA256:zQ9L…" },
        term: [
          { k: "warn", t: "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!" },
          { k: "warn", t: "IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!" },
        ],
      },
      {
        phase: "verify-server",
        title: "Close the connection",
        kind: "local",
        side: "client",
        label: "Close connection",
        vis: "local",
        bad: true,
        endpoint: "SSH did not make session keys. SSH did not send credentials.",
        explain:
          "SSH stops here. SSH did not use any secret. This is the purpose of the check.",
        term: [{ k: "warn", t: "Host key verification failed." }],
      },
    ];
  }
  if (scenario === "unauthorized") {
    return [
      ...BASE_STEPS.slice(0, 10),
      {
        phase: "verify-user",
        title: "The key is not authorized",
        kind: "local",
        side: "server",
        label: "Check authorized_keys",
        vis: "local",
        bad: true,
        endpoint: "The key is not in /home/ubuntu/.ssh/authorized_keys ✗",
        explain: "The server looks for the public key. It does not find the key.",
        why: "A valid key pair is not sufficient. The public key must be in authorized_keys.",
        uses: ["server.authorized"],
        chipNote: { "server.authorized": "your public key is not in the file" },
      },
      {
        phase: "verify-user",
        title: "Reject the login",
        kind: "packet",
        dir: "s2c",
        label: "Permission denied",
        vis: "cipher",
        bad: true,
        endpoint: "SSH_MSG_USERAUTH_FAILURE\ncan continue with: publickey",
        explain:
          "The server tells the client that the login failed. The connection is encrypted, so the failure message is also private.",
        uses: ["server.session"],
        term: [{ k: "warn", t: "ubuntu@192.168.1.20: Permission denied (publickey)." }],
      },
    ];
  }
  return BASE_STEPS;
}

const CHIPS: Record<ChipId, { title: string; sub: string; tag?: string; icon: LucideIcon }> = {
  "client.private": {
    title: "Private key",
    sub: "ssh-key-2026-06-14.key",
    tag: "stays on client",
    icon: KeyRound,
  },
  "client.known": {
    title: "known_hosts",
    sub: "SHA256:xK3Q…",
    icon: Fingerprint,
  },
  "client.session": { title: "Session keys", sub: "", tag: "never sent", icon: Lock },
  "server.host": {
    title: "Host key",
    sub: "ssh_host_ed25519_key",
    tag: "private part stays here",
    icon: ShieldCheck,
  },
  "server.authorized": {
    title: "authorized_keys",
    sub: "~/.ssh/authorized_keys",
    icon: FileKey,
  },
  "server.session": { title: "Session keys", sub: "", tag: "never sent", icon: Lock },
};

/* -------------------------------------------------------------------------- */
/* Text effects                                                               */
/* -------------------------------------------------------------------------- */

/** Stable pseudo-random hex bytes, so a step always shows the same ciphertext. */
function fakeCipher(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s;
  };
  const byte = () => (next() >>> 24).toString(16).padStart(2, "0");
  const line = (len: number) => Array.from({ length: len }, byte).join(" ");
  return `${line(8)}\n${line(8)}\n${line(6)}`;
}

/** Types plain text, or changes scrambled bytes into ciphertext. Plays one time for each change. */
function Reveal({ text, mode }: { text: string; mode: "type" | "scramble" }) {
  const reduce = useReducedMotion();
  const [p, setP] = useState(1);

  useEffect(() => {
    if (reduce) {
      setP(1);
      return;
    }
    setP(0);
    let frame = 0;
    const total = 16;
    const id = setInterval(() => {
      frame += 1;
      setP(Math.min(1, frame / total));
      if (frame >= total) clearInterval(id);
    }, 34);
    return () => clearInterval(id);
  }, [text, mode, reduce]);

  const reveal = Math.floor(p * text.length);
  if (mode === "type") {
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground">
        {text.slice(0, reveal)}
        <span className="opacity-0">{text.slice(reveal)}</span>
      </pre>
    );
  }
  const glyphs = "0123456789abcdef";
  const shown = text
    .split("")
    .map((ch, i) =>
      ch === " " || ch === "\n" || i < reveal ? ch : glyphs[Math.floor(Math.random() * 16)],
    )
    .join("");
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-mint">
      {shown}
    </pre>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** True on screens wide enough for the machines to sit side by side. */
function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

type Trust = "pending" | "ok" | "fail";

/** The three things SSH must prove, as of the current step. */
function trustAt(steps: StepDef[], idx: number) {
  const has = (title: string) => {
    const k = steps.findIndex((s) => s.title === title);
    return k >= 0 && k <= idx;
  };
  const newkeysAt = steps.findIndex((s) => s.newkeys);
  const server: Trust = has("The host key is different")
    ? "fail"
    : has("Check the server")
      ? "ok"
      : "pending";
  const encryption: Trust = newkeysAt >= 0 && idx >= newkeysAt ? "ok" : "pending";
  const user: Trust = has("The key is not authorized")
    ? "fail"
    : has("Accept the login")
      ? "ok"
      : "pending";
  return { server, encryption, user };
}

function chipStatus(id: ChipId, steps: StepDef[], active: number) {
  const upto = steps.slice(0, active + 1);
  const cur = steps[active];
  const present = id.endsWith(".session") ? upto.some((s) => s.derives) : true;
  const used = !!cur.uses?.includes(id);
  const bad = used && !!cur.bad;
  const noteStep = [...upto].reverse().find((s) => s.chipNote?.[id]);
  return { present, used, bad, note: noteStep?.chipNote?.[id], noteBad: !!noteStep?.bad };
}

function roleOf(step: StepDef, side: "client" | "server") {
  if (step.kind === "local") {
    const on = step.side === "both" || step.side === side;
    return { label: on ? "Working" : "Idle", active: on };
  }
  const dir = step.dir ?? "c2s";
  if (dir === "both") return { label: "Send + receive", active: true };
  const sends = (dir === "c2s") === (side === "client");
  return { label: sends ? "Sending" : "Receiving", active: true };
}

const TONE = {
  violet: {
    border: "border-violet/60",
    bg: "bg-violet/10",
    text: "text-violet",
    glow: "shadow-[0_0_28px_-8px_var(--violet)]",
  },
  amber: {
    border: "border-amber/60",
    bg: "bg-amber/10",
    text: "text-amber",
    glow: "shadow-[0_0_28px_-8px_var(--amber)]",
  },
  rose: {
    border: "border-rose/60",
    bg: "bg-rose/10",
    text: "text-rose",
    glow: "shadow-[0_0_28px_-8px_var(--rose)]",
  },
} as const;

/** Height of the stage and of the bottom row on large screens. */
const PANEL_H = "lg:h-[14.5rem]";

/* -------------------------------------------------------------------------- */
/* Trust badges                                                               */
/* -------------------------------------------------------------------------- */

const TRUST_STYLE: Record<Trust, string> = {
  pending: "border-dashed border-hairline text-muted-foreground",
  ok: "border-mint/50 bg-mint/10 text-mint",
  fail: "border-rose/50 bg-rose/10 text-rose",
};

function TrustBadge({
  icon: Icon,
  label,
  status,
  words,
}: {
  icon: LucideIcon;
  label: string;
  status: Trust;
  words: [string, string, string];
}) {
  const word = status === "pending" ? words[0] : status === "ok" ? words[1] : words[2];
  return (
    <motion.div
      key={status}
      initial={{ scale: 0.92, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors",
        TRUST_STYLE[status],
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      <span className="font-mono text-[10px]">
        {status === "ok" ? "✓ " : status === "fail" ? "✗ " : ""}
        {word}
      </span>
    </motion.div>
  );
}

function TrustBar({ steps, idx }: { steps: StepDef[]; idx: number }) {
  const t = trustAt(steps, idx);
  return (
    <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Checks that SSH has done so far">
      <TrustBadge
        icon={ShieldCheck}
        label="Server"
        status={t.server}
        words={["not checked", "verified", "mismatch"]}
      />
      <TrustBadge icon={Lock} label="Encryption" status={t.encryption} words={["off", "on", "off"]} />
      <TrustBadge
        icon={KeyRound}
        label="User"
        status={t.user}
        words={["not checked", "verified", "denied"]}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Machines                                                                   */
/* -------------------------------------------------------------------------- */

function KeySlot({ id, steps, idx }: { id: ChipId; steps: StepDef[]; idx: number }) {
  const d = CHIPS[id];
  const Icon = d.icon;
  const st = chipStatus(id, steps, idx);
  const sub = d.sub || (st.present ? "same on both sides" : "not made yet");
  return (
    <motion.div
      initial={false}
      animate={{ scale: st.used ? 1.02 : 1, opacity: st.present ? 1 : 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "min-w-0 rounded-lg border px-2.5 py-1.5 transition-colors",
        st.bad
          ? "border-rose/60 bg-rose/10"
          : st.used
            ? "border-mint/60 bg-mint/10"
            : "border-hairline bg-background",
        !st.present && "border-dashed",
      )}
      style={
        st.used && !st.bad
          ? { boxShadow: "0 0 14px color-mix(in oklab, var(--mint) 35%, transparent)" }
          : undefined
      }
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            st.bad ? "text-rose" : st.used ? "text-mint" : "text-muted-foreground",
          )}
        />
        <span className="shrink-0 text-xs font-semibold text-foreground">{d.title}</span>
        {!st.note && (
          <span
            title={sub}
            className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground"
          >
            {sub}
          </span>
        )}
      </div>
      {st.note && (
        <p
          className={cn(
            "mt-0.5 whitespace-pre-line break-words pl-[22px] font-mono text-[10px] leading-snug",
            st.noteBad ? "text-rose" : "text-muted-foreground",
          )}
        >
          {st.note}
        </p>
      )}
    </motion.div>
  );
}

function Machine({
  side,
  step,
  steps,
  idx,
}: {
  side: "client" | "server";
  step: StepDef;
  steps: StepDef[];
  idx: number;
}) {
  const isClient = side === "client";
  const Icon = isClient ? Laptop : Server;
  const role = roleOf(step, side);
  const working = role.active && step.kind === "local";
  const T = TONE[step.bad && role.active ? "rose" : isClient ? "violet" : "amber"];
  const ids: ChipId[] = isClient
    ? ["client.private", "client.known", "client.session"]
    : ["server.host", "server.authorized", "server.session"];
  const reduce = !!useReducedMotion();
  const arrives = step.kind === "packet" && role.active && role.label !== "Sending";
  const pulseDelay = reduce ? 0 : role.label === "Receiving" ? 1.4 : 1.9;
  const idle = !role.active
    ? "Waiting"
    : role.label === "Sending"
      ? "Sends a message"
      : role.label === "Receiving"
        ? "Reads the message"
        : "Sends and reads messages";

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col gap-2 rounded-xl border bg-card/60 p-3 transition-all duration-300",
        role.active ? cn(T.border, T.glow) : "border-hairline",
      )}
    >
      {arrives && (
        <motion.span
          key={`${idx}-arrive`}
          aria-hidden
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 0.9, 0], scale: [1, 1.015, 1.05] }}
          transition={{ duration: 0.7, delay: pulseDelay, ease: "easeOut" }}
          className={cn("pointer-events-none absolute inset-0 rounded-xl border-2", T.border)}
        />
      )}
      <div className="flex items-center gap-2.5">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", T.bg, T.text)}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate whitespace-nowrap text-sm font-semibold leading-tight text-foreground">
            {isClient ? "Your laptop" : "Remote server"}
          </p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">
            {isClient ? "SSH client" : "192.168.1.20:22"}
          </p>
        </div>
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors",
            role.active ? cn(T.border, T.bg, T.text) : "border-hairline text-muted-foreground",
          )}
        >
          {role.label}
        </span>
      </div>

      <div className="min-h-[2rem]">
        <AnimatePresence mode="wait" initial={false}>
          {working ? (
            <motion.div
              key={`${idx}-work`}
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5", T.border, T.bg)}
            >
              <span className={cn("truncate font-mono text-[11px] font-semibold", T.text)}>
                {step.label}
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 400, damping: 18 }}
                className="ml-auto shrink-0"
              >
                {step.bad ? (
                  <X className="size-3.5 text-rose" />
                ) : (
                  <Check className="size-3.5 text-mint" />
                )}
              </motion.span>
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-1 py-1.5 text-xs text-muted-foreground"
            >
              {idle}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1.5">
        {ids.map((id) => (
          <KeySlot key={id} id={id} steps={steps} idx={idx} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The wire                                                                   */
/* -------------------------------------------------------------------------- */

function Envelope({
  label,
  kind,
  horiz,
  from,
  lane,
  delay,
  reduce,
}: {
  label: string;
  kind: "plain" | "cipher" | "bad";
  horiz: boolean;
  from: 0 | 1;
  lane: number;
  delay: number;
  reduce: boolean;
}) {
  const a = from === 0 ? "10%" : "90%";
  const b = from === 0 ? "90%" : "10%";
  const Icon = kind === "cipher" ? Lock : Mail;
  const cls =
    kind === "bad"
      ? "border-rose/60 bg-rose/15 text-rose"
      : kind === "cipher"
        ? "border-mint/60 bg-mint/15 text-mint"
        : "border-amber/60 bg-amber/15 text-amber";
  const cross = horiz ? { top: `calc(50% + ${lane}px)` } : { left: `calc(50% + ${lane}px)` };
  const initial = horiz ? { left: a, opacity: 0 } : { top: a, opacity: 0 };
  const animate = reduce
    ? horiz
      ? { left: b, opacity: 1 }
      : { top: b, opacity: 1 }
    : horiz
      ? { left: [a, b], opacity: [0, 1, 1, 1, 0] }
      : { top: [a, b], opacity: [0, 1, 1, 1, 0] };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{
        duration: 1.5,
        delay,
        ease: "easeInOut",
        opacity: { duration: 1.5, delay, times: [0, 0.1, 0.5, 0.9, 1] },
      }}
      style={cross}
      className={cn(
        "pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 font-mono text-[10px] font-semibold shadow-lg backdrop-blur-sm",
        cls,
      )}
    >
      <Icon className="size-3 shrink-0" />
      {label}
    </motion.div>
  );
}

function Wire({
  step,
  idx,
  flightKey,
  encrypted,
  tubeDelayed,
  horiz,
  reduce,
}: {
  step: StepDef;
  idx: number;
  flightKey: string;
  encrypted: boolean;
  tubeDelayed: boolean;
  horiz: boolean;
  reduce: boolean;
}) {
  const dir = step.dir ?? "c2s";
  const kind = step.bad ? "bad" : step.vis === "cipher" ? "cipher" : "plain";
  const flights: { from: 0 | 1; lane: number; delay: number }[] =
    step.kind !== "packet"
      ? []
      : dir === "both"
        ? [
          { from: 0, lane: -12, delay: 0 },
          { from: 1, lane: 12, delay: 0.45 },
        ]
        : [{ from: dir === "c2s" ? 0 : 1, lane: 0, delay: 0 }];
  const tubeStyle = { transitionDelay: tubeDelayed && !reduce ? "1.4s" : "0s" };

  return (
    <div className={cn("relative", horiz ? "min-h-[14.5rem]" : "h-44")}>
      {/* the cable, which becomes a tube when encryption is on */}
      <div
        style={tubeStyle}
        className={cn(
          "absolute transition-all duration-500",
          horiz
            ? "left-0 right-0 top-1/2 -translate-y-1/2"
            : "bottom-0 top-0 left-1/2 -translate-x-1/2",
          encrypted
            ? cn(
              "rounded-2xl border-[1.5px] border-dashed border-mint/60 bg-mint/10",
              horiz ? "h-12" : "w-12",
            )
            : cn(
              "rounded-full",
              horiz ? "h-1" : "w-1",
              step.bad && step.kind === "packet" ? "bg-rose/50" : "bg-foreground/25",
            ),
        )}
      />
      {step.kind === "packet" && !reduce && (
        <motion.div
          key={`flow-${flightKey}`}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            ...(horiz
              ? { backgroundPositionX: ["0px", dir === "s2c" ? "-16px" : "16px"] }
              : { backgroundPositionY: ["0px", dir === "s2c" ? "-16px" : "16px"] }),
          }}
          transition={{
            opacity: { duration: 2.2, times: [0, 0.1, 0.8, 1] },
            backgroundPositionX: { duration: 0.45, repeat: 4, ease: "linear" },
            backgroundPositionY: { duration: 0.45, repeat: 4, ease: "linear" },
          }}
          style={{
            backgroundImage: `repeating-linear-gradient(${horiz ? "90deg" : "180deg"}, currentColor 0 8px, transparent 8px 16px)`,
          }}
          className={cn(
            "pointer-events-none absolute",
            horiz
              ? "left-0 right-0 top-1/2 h-[3px] -translate-y-1/2"
              : "bottom-0 top-0 left-1/2 w-[3px] -translate-x-1/2",
            kind === "bad" ? "text-rose" : kind === "cipher" ? "text-mint" : "text-amber",
          )}
        />
      )}
      <span
        style={tubeStyle}
        className={cn(
          "pointer-events-none absolute whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mint transition-opacity duration-500",
          horiz
            ? "left-1/2 top-[calc(50%-2.6rem)] -translate-x-1/2"
            : "left-[calc(50%+2rem)] top-1/2 -translate-y-1/2",
          encrypted ? "opacity-100" : "opacity-0",
        )}
      >
        Encrypted tunnel
      </span>

      {step.kind === "local" && (
        <p className="absolute inset-x-2 top-3 text-center text-[11px] text-muted-foreground">
          No traffic. The machine works alone.
        </p>
      )}

      {flights.map((f) => (
        <Envelope
          key={`${flightKey}-${f.from}`}
          label={step.label}
          kind={kind}
          horiz={horiz}
          from={f.from}
          lane={f.lane}
          delay={f.delay}
          reduce={reduce}
        />
      ))}

      {/* the person who listens on the network */}
      <div
        className={cn(
          "absolute flex flex-col items-center gap-0.5 text-center",
          horiz ? "bottom-2 left-1/2 -translate-x-1/2" : "left-2 top-1/2 -translate-y-1/2",
        )}
      >
        <span
          className={cn(
            "grid size-8 place-items-center rounded-full border transition-colors",
            step.vis === "plain"
              ? "border-amber/60 bg-amber/15 text-amber"
              : step.vis === "cipher"
                ? "border-mint/50 bg-mint/10 text-mint"
                : "border-hairline text-muted-foreground",
          )}
        >
          <Eye className="size-4" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Eavesdropper
        </span>
        <span
          className={cn(
            "font-mono text-[10px]",
            step.vis === "plain"
              ? "text-amber"
              : step.vis === "cipher"
                ? "text-mint"
                : "text-muted-foreground",
          )}
        >
          {step.vis === "plain"
            ? "reads it"
            : step.vis === "cipher"
              ? "sees only noise"
              : "sees nothing"}
        </span>
      </div>
      <span className="sr-only">Step {idx + 1}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step card and bottom panel                                                 */
/* -------------------------------------------------------------------------- */

function StepCard({ step, index, total }: { step: StepDef; index: number; total: number }) {
  const phase = PHASES.find((p) => p.id === step.phase)?.label ?? "";
  return (
    <div
      className={cn(
        "overflow-y-auto rounded-xl border border-hairline bg-background p-3",
        PANEL_H,
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
            step.bad
              ? "border-rose/40 bg-rose/10 text-rose"
              : "border-mint/40 bg-mint/10 text-mint",
          )}
        >
          {phase}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          Step <span className="text-foreground">{index + 1}</span> of {total}
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${step.title}-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          aria-live="polite"
        >
          <h4 className="text-base font-semibold text-foreground">{step.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.explain}</p>
          {step.why && (
            <div
              className={cn(
                "mt-2 flex items-start gap-2.5 rounded-lg border px-2.5 py-2",
                step.bad ? "border-rose/40 bg-rose/10" : "border-violet/30 bg-violet/10",
              )}
            >
              {step.bad ? (
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rose" />
              ) : (
                <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-violet">
                  why
                </span>
              )}
              <p className="text-[13px] leading-relaxed text-foreground/90">{step.why}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Inspector({ step, index }: { step: StepDef; index: number }) {
  const cipherText = useMemo(() => fakeCipher(index + 7), [index]);
  const local = step.vis === "local";
  const leftNote =
    step.vis === "cipher"
      ? "Ciphertext + integrity tag"
      : step.vis === "plain"
        ? "Plain text. No key needed."
        : "No data crosses the network.";
  const rightNote =
    step.vis === "cipher"
      ? "After decryption with the session key"
      : step.vis === "plain"
        ? "The same text. No key needed."
        : "The result of this step";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Eye className="size-3.5" />
          Eavesdropper sees
        </p>
        <div
          className={cn(
            "min-h-[4.5rem] flex-1 rounded-lg border px-2.5 py-2",
            local ? "border-dashed border-hairline" : "border-hairline bg-muted/20",
          )}
        >
          {step.vis === "plain" && <Reveal key={`w-${index}`} text={step.wire ?? ""} mode="type" />}
          {step.vis === "cipher" && (
            <Reveal key={`c-${index}`} text={cipherText} mode="scramble" />
          )}
          {local && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Nothing. This step happens inside the machine. No data crosses the network.
            </p>
          )}
        </div>
        <p
          className={cn(
            "flex items-center gap-1 font-mono text-[10px]",
            step.vis === "cipher"
              ? "text-mint"
              : step.vis === "plain"
                ? "text-amber"
                : "text-muted-foreground",
          )}
        >
          {step.vis === "cipher" && <Lock className="size-3" />}
          {leftNote}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {local ? "The machine calculates" : "Receiver reads"}
        </p>
        <div className="min-h-[4.5rem] flex-1 rounded-lg border border-hairline bg-muted/20 px-2.5 py-2">
          <pre
            className={cn(
              "whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed",
              step.bad ? "text-rose" : "text-foreground",
            )}
          >
            {step.endpoint}
          </pre>
        </div>
        <p
          className={cn(
            "flex items-center gap-1 font-mono text-[10px]",
            step.vis === "cipher" ? "text-mint" : "text-muted-foreground",
          )}
        >
          {step.vis === "cipher" && <Unlock className="size-3" />}
          {rightNote}
        </p>
      </div>
    </div>
  );
}

const LINE_TONE: Record<TermLine["k"], string> = {
  cmd: "text-slate-100",
  out: "text-slate-400",
  warn: "text-rose",
};

function TerminalPane({ lines }: { lines: TermLine[] }) {
  const shown = lines.slice(-10);
  return (
    <div className="h-full min-h-[8rem] overflow-y-auto rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed">
      {shown.length === 0 ? (
        <p className="text-slate-500">No output yet.</p>
      ) : (
        shown.map((l, k) => (
          <p key={`${lines.length - shown.length + k}`} className={cn("break-words", LINE_TONE[l.k])}>
            {l.t}
          </p>
        ))
      )}
    </div>
  );
}

function LogPane({ lines }: { lines: string[] }) {
  const shown = lines.slice(-10);
  return (
    <div className="h-full min-h-[8rem] overflow-y-auto rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
        ssh -v output (shortened)
      </p>
      {shown.length === 0 ? (
        <p className="text-slate-500">No output yet.</p>
      ) : (
        shown.map((l, k) => (
          <p
            key={`${lines.length - shown.length + k}`}
            className={cn(
              "break-words",
              l.startsWith("@@@") || l.includes("failed") || l.includes("denied")
                ? "text-rose"
                : "text-slate-400",
            )}
          >
            {l}
          </p>
        ))
      )}
    </div>
  );
}

type TabId = "wire" | "terminal" | "log";

const TABS: { id: TabId; label: string }[] = [
  { id: "wire", label: "On the wire" },
  { id: "terminal", label: "Terminal" },
  { id: "log", label: "ssh -v output" },
];

function BottomPanel({
  step,
  index,
  lines,
  vlines,
}: {
  step: StepDef;
  index: number;
  lines: TermLine[];
  vlines: string[];
}) {
  const [tab, setTab] = useState<TabId>("wire");
  return (
    <div className={cn("flex min-h-0 flex-col rounded-xl border border-hairline bg-background", PANEL_H)}>
      <div className="flex shrink-0 gap-1 border-b border-hairline px-2 pt-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-t-md border border-b-0 px-2.5 py-1 text-xs font-medium transition-colors",
              tab === t.id
                ? "border-hairline bg-muted/40 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3" role="tabpanel">
        {tab === "wire" && <Inspector step={step} index={index} />}
        {tab === "terminal" && <TerminalPane lines={lines} />}
        {tab === "log" && <LogPane lines={vlines} />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export function SshConnectionFlow() {
  const reduce = !!useReducedMotion();
  const horiz = useIsWide();
  const [scenario, setScenario] = useState<ScenarioId>("normal");
  const steps = useMemo(() => buildSteps(scenario), [scenario]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const idx = Math.min(i, steps.length - 1);
  const step = steps[idx];
  const last = steps.length - 1;

  const lines = useMemo(() => steps.slice(0, idx + 1).flatMap((s) => s.term ?? []), [steps, idx]);
  const vlines = useMemo(() => steps.slice(0, idx + 1).flatMap((s) => s.vlog ?? []), [steps, idx]);

  const newkeysAt = steps.findIndex((s) => s.newkeys);
  const encrypted = newkeysAt >= 0 && idx >= newkeysAt;

  const phasesPresent = PHASES.filter((p) => steps.some((s) => s.phase === p.id));
  const activeOrder = phasesPresent.findIndex((p) => p.id === step.phase);

  // Autoplay: each step stays on screen long enough to read the text.
  useEffect(() => {
    if (!playing) return;
    if (idx >= last) {
      setPlaying(false);
      return;
    }
    const ms = Math.min(2800 + step.explain.length * 12, 7000) / speed;
    const t = setTimeout(() => setI((x) => Math.min(last, x + 1)), ms);
    return () => clearTimeout(t);
  }, [playing, idx, last, speed, step.explain.length]);

  const jump = (k: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(last, k)));
  };
  const togglePlay = () => {
    if (!playing && idx >= last) setI(0);
    setPlaying((p) => !p);
  };
  const restart = () => {
    setPlaying(false);
    setI(0);
  };
  const pickScenario = (id: ScenarioId) => {
    setScenario(id);
    setI(0);
    setPlaying(true);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      jump(idx + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      jump(idx - 1);
    } else if (e.key === " ") {
      e.preventDefault();
      togglePlay();
    } else if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      restart();
    }
  };

  const iconBtn =
    "grid size-8 place-items-center rounded-md border border-hairline text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="my-6 overflow-hidden rounded-2xl border border-hairline bg-card/50 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mint/50"
    >
      {/* header: title and scenario picker */}
      <div className="border-b border-hairline bg-muted/20 px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <LockKeyhole className="size-4 text-mint" />
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Watch an SSH connection
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:ml-auto" role="group" aria-label="Scenario">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.hint}
                aria-pressed={scenario === s.id}
                onClick={() => pickScenario(s.id)}
                className={cn(
                  "rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
                  scenario === s.id
                    ? s.id === "normal" || s.id === "password"
                      ? "border-mint/50 bg-mint/10 text-mint"
                      : "border-rose/50 bg-rose/10 text-rose"
                    : "border-hairline text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 p-3 sm:p-4">
        {/* phases and controls */}
        <div className="flex flex-wrap gap-1" aria-label="Connection phases">
          {phasesPresent.map((p, order) => {
            const first = steps.findIndex((s) => s.phase === p.id);
            const state = order < activeOrder ? "done" : order === activeOrder ? "active" : "todo";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => jump(first)}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  state === "active" &&
                  (step.bad
                    ? "border-rose/50 bg-rose/10 text-rose"
                    : "border-mint/60 bg-mint/15 text-mint"),
                  state === "done" && "border-mint/25 bg-mint/5 text-mint/80 hover:bg-mint/10",
                  state === "todo" &&
                  "border-hairline text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {order + 1}. {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Restart"
              title="Restart (R)"
              onClick={restart}
              className={iconBtn}
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Previous step"
              title="Previous (←)"
              onClick={() => jump(idx - 1)}
              disabled={idx === 0}
              className={iconBtn}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              title="Play / pause (Space)"
              onClick={togglePlay}
              className="flex h-8 items-center gap-1.5 rounded-md bg-mint px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-mint/90"
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {playing ? "Pause" : idx >= last ? "Replay" : "Play"}
            </button>
            <button
              type="button"
              aria-label="Next step"
              title="Next (→)"
              onClick={() => jump(idx + 1)}
              disabled={idx >= last}
              className={iconBtn}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div
            className="order-last flex min-w-[10rem] basis-full items-center gap-1 sm:order-none sm:basis-0 sm:flex-1"
            role="group"
            aria-label="Steps"
          >
            {steps.map((s, k) => (
              <button
                key={k}
                type="button"
                title={`${k + 1}. ${s.title}`}
                aria-label={`Go to step ${k + 1}: ${s.title}`}
                aria-current={k === idx ? "step" : undefined}
                onClick={() => jump(k)}
                className="group flex h-5 flex-1 items-center"
              >
                <span
                  className={cn(
                    "w-full rounded-full transition-all",
                    k === idx
                      ? cn("h-2.5", s.bad ? "bg-rose" : "bg-mint")
                      : cn(
                        "h-1.5",
                        k < idx
                          ? s.bad
                            ? "bg-rose/60"
                            : "bg-mint/50"
                          : "bg-muted group-hover:bg-muted-foreground/30",
                      ),
                  )}
                />
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              speed
            </span>
            <div className="flex gap-1" role="group" aria-label="Playback speed">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={speed === s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "rounded-md border px-1.5 py-1 font-mono text-[10px] transition-colors",
                    speed === s
                      ? "border-mint/50 bg-mint/10 text-mint"
                      : "border-hairline text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* the stage */}
        <div className="rounded-xl border border-hairline bg-background p-3">
          <TrustBar steps={steps} idx={idx} />
          <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-0">
            <Machine side="client" step={step} steps={steps} idx={idx} />
            <Wire
              step={step}
              idx={idx}
              flightKey={`${scenario}-${idx}`}
              encrypted={encrypted}
              tubeDelayed={idx === newkeysAt}
              horiz={horiz}
              reduce={reduce}
            />
            <Machine side="server" step={step} steps={steps} idx={idx} />
          </div>
        </div>

        {/* explanation and tabbed detail */}
        <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
          <StepCard step={step} index={idx} total={steps.length} />
          <BottomPanel step={step} index={idx} lines={lines} vlines={vlines} />
        </div>

        <p className="text-[11px] text-muted-foreground">
          Click a bar segment to go to a step. Click the box. Then use ← → and Space.
        </p>
      </div>
    </section>
  );
}