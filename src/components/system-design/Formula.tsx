import { Fragment } from "react";

import type { FormulaToken } from "@/lessons/types";

/*
 * A typeset formula for system design lessons: serif type, real fractions with a bar, and
 * subscripts. Single letters are variables and render in italic; words stay upright. Each entry of
 * `lines` is one row of the formula.
 */

const SERIF = '"Latin Modern Roman", "STIX Two Text", "Times New Roman", Georgia, serif';

const isVariable = (s: string) => /^[A-Za-zλ]$/.test(s);

function Text({ children }: { children: string }) {
  return <span className={isVariable(children) ? "italic" : undefined}>{children}</span>;
}

function Token({ token }: { token: FormulaToken }) {
  if (typeof token === "string") return <Text>{token}</Text>;
  if ("sub" in token) {
    return (
      <span>
        <Text>{token.sub[0]}</Text>
        <sub className="text-[0.62em]">
          <Text>{token.sub[1]}</Text>
        </sub>
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col items-center align-middle leading-tight">
      <span className="px-1.5 pb-0.5">
        <Text>{token.frac[0]}</Text>
      </span>
      <span className="w-full border-t-[1.5px] border-foreground" />
      <span className="px-1.5 pt-0.5">
        <Text>{token.frac[1]}</Text>
      </span>
    </span>
  );
}

export function Formula({ caption, lines }: { caption?: string; lines: FormulaToken[][] }) {
  const label = lines
    .map((line) =>
      line
        .map((t) =>
          typeof t === "string"
            ? t
            : "sub" in t
              ? `${t.sub[0]} sub ${t.sub[1]}`
              : `${t.frac[0]} over ${t.frac[1]}`,
        )
        .join(" "),
    )
    .join(", ");

  return (
    <figure className="w-full max-w-full overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      {caption ? (
        <figcaption className="px-5 pt-4 text-base font-semibold text-foreground">
          {caption}
        </figcaption>
      ) : null}
      <div
        role="math"
        aria-label={label}
        className="flex flex-col items-center gap-3 overflow-x-auto px-5 py-6 text-foreground"
        style={{ fontFamily: SERIF }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-[1.35rem] sm:text-[1.7rem]"
          >
            {line.map((token, j) => (
              <Fragment key={j}>
                <Token token={token} />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </figure>
  );
}
