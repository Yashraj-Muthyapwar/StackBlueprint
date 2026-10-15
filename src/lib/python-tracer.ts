import { z } from "zod";

// Python source for an in-process tracer that captures a list of
// snapshots (one per executed line) and returns them as JSON.
//
// Each snapshot:
//   { event, line, frames: [{name, line, locals:{name: Value}}], heap: {id: Obj}, stdout }
//
// Value: {kind:"prim", type, value} | {kind:"ref", id}
// Obj:   {type:"list"|"tuple"|"set", items:[Value]}
//      | {type:"dict", items:[[Value,Value]]}
//      | {type, repr}

export const TRACER_PY = `
import sys, io, json, builtins, itertools, math

MAX_STEPS = 400
MAX_COLL = 50
MAX_STR = 120
MAX_STDOUT = 10000
MAX_TRACE = 1000000
MAX_NODES = 1000
MAX_HEAP = 200
MAX_DEPTH = 6
MAX_FRAMES = 20
MAX_LOCALS = 50

class _BoundedOutput(io.TextIOBase):
    def __init__(self):
        self.parts = []
        self.size = 0
    def write(self, text):
        remaining = MAX_STDOUT - self.size
        clipped = text[:remaining]
        if clipped:
            self.parts.append(clipped)
        self.size += len(clipped)
        if len(text) > remaining:
            raise RuntimeError("Trace output limit reached. Print less data.")
        return len(text)
    def getvalue(self):
        return "".join(self.parts)


def _run_traced(src):
    snapshots = []
    stdout_buf = _BoundedOutput()
    trace_size = 0
    nodes = 0

    code = compile(src, "<user>", "exec")
    user_globals = {"__name__": "__main__", "__builtins__": builtins}

    def ser(v, heap, depth=0):
        nonlocal nodes
        nodes += 1
        if nodes > MAX_NODES or depth > MAX_DEPTH:
            return {"kind":"prim","type":"limit","value":"<display limit>"}
        if v is None or isinstance(v, bool):
            return {"kind":"prim","type":type(v).__name__[:MAX_STR],"value":repr(v)}
        if isinstance(v, int):
            value = v if v.bit_length() <= 1024 else "<large integer>"
            return {"kind":"prim","type":"int","value":value}
        if isinstance(v, float):
            return {"kind":"prim","type":"float","value":v if math.isfinite(v) else repr(v)}
        if isinstance(v, str):
            s = v if len(v) <= MAX_STR else v[:MAX_STR] + "…"
            return {"kind":"prim","type":"str","value":repr(s)}
        oid = str(id(v))
        if oid in heap:
            return {"kind":"ref","id":oid}
        if len(heap) >= MAX_HEAP:
            return {"kind":"prim","type":"limit","value":"<heap limit>"}
        # placeholder for cycles
        heap[oid] = {"type": type(v).__name__[:MAX_STR], "items": []}
        try:
            if isinstance(v, list):
                items = [ser(x, heap, depth+1) for x in itertools.islice(v, MAX_COLL)]
                heap[oid] = {"type":"list","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            elif isinstance(v, tuple):
                items = [ser(x, heap, depth+1) for x in itertools.islice(v, MAX_COLL)]
                heap[oid] = {"type":"tuple","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            elif isinstance(v, set):
                items = [ser(x, heap, depth+1) for x in itertools.islice(v, MAX_COLL)]
                heap[oid] = {"type":"set","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            elif isinstance(v, dict):
                items = []
                for i,(k,val) in enumerate(v.items()):
                    if i >= MAX_COLL: break
                    items.append([ser(k, heap, depth+1), ser(val, heap, depth+1)])
                heap[oid] = {"type":"dict","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            else:
                heap[oid] = {"type": type(v).__name__[:MAX_STR], "repr": repr(v)[:MAX_STR]}
        except Exception as e:
            heap[oid] = {"type": type(v).__name__[:MAX_STR], "repr": ("<unrepr: %s>" % e)[:MAX_STR]}
        return {"kind":"ref","id":oid}

    def snapshot(event, frame, arg=None):
        nonlocal trace_size, nodes
        nodes = 0
        if len(snapshots) >= MAX_STEPS:
            raise RuntimeError("Step limit reached (%d). Simplify the program." % MAX_STEPS)
        heap = {}
        frames = []
        f = frame
        while f is not None and f.f_code.co_filename == "<user>" and len(frames) < MAX_FRAMES:
            locs = {}
            for k, val in itertools.islice(f.f_locals.items(), MAX_LOCALS):
                if k.startswith("__"): continue
                try:
                    locs[k] = ser(val, heap)
                except Exception:
                    locs[k] = {"kind":"prim","type":"?","value":"<unser>"}
            frames.append({
                "name": "<module>" if f.f_code.co_name == "<module>" else f.f_code.co_name[:MAX_STR],
                "line": f.f_lineno,
                "locals": locs,
            })
            f = f.f_back
        frames.reverse()
        snap = {
            "event": event,
            "line": frame.f_lineno,
            "frames": frames,
            "heap": heap,
            "stdout": stdout_buf.getvalue(),
        }
        if event == "return":
            try:
                snap["returnValue"] = ser(arg, heap)
            except Exception:
                snap["returnValue"] = {"kind":"prim","type":"?","value":"<unser>"}
        elif event == "call":
            # Annotate the call with the function name of the new frame
            snap["callName"] = "<module>" if frame.f_code.co_name == "<module>" else frame.f_code.co_name[:MAX_STR]
        trace_size += len(json.dumps(snap))
        if trace_size > MAX_TRACE:
            raise RuntimeError("Trace size limit reached. Use a smaller example.")
        snapshots.append(snap)

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<user>":
            return None
        if event in ("line", "call", "return"):
            snapshot(event, frame, arg)
        return tracer


    err = None
    real_stdout = sys.stdout
    sys.stdout = stdout_buf
    try:
        sys.settrace(tracer)
        try:
            exec(code, user_globals)
        finally:
            sys.settrace(None)
    except Exception as e:
        err = ("%s: %s" % (type(e).__name__, e))[:2000]
    finally:
        sys.stdout = real_stdout

    return json.dumps({"snapshots": snapshots, "error": err, "stdout": stdout_buf.getvalue()})
`;

const valueSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("prim"),
    type: z.string().max(120),
    value: z.union([z.string().max(1000), z.number().finite(), z.boolean()]),
  }),
  z.object({ kind: z.literal("ref"), id: z.string().max(128) }),
]);
const heapSchema = z.union([
  z.object({
    type: z.enum(["list", "tuple", "set"]),
    items: z.array(valueSchema).max(50),
    size: z.number().int().nonnegative(),
    truncated: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("dict"),
    items: z.array(z.tuple([valueSchema, valueSchema])).max(50),
    size: z.number().int().nonnegative(),
    truncated: z.boolean().optional(),
  }),
  z.object({ type: z.string().max(120), repr: z.string().max(1000) }),
]);
const traceSchema = z.object({
  snapshots: z
    .array(
      z.object({
        event: z.enum(["line", "call", "return"]),
        line: z.number().int().nonnegative(),
        frames: z
          .array(
            z.object({
              name: z.string().max(120),
              line: z.number().int().nonnegative(),
              locals: z.record(valueSchema).refine((values) => Object.keys(values).length <= 50),
            }),
          )
          .max(20),
        heap: z.record(heapSchema).refine((values) => Object.keys(values).length <= 200),
        stdout: z.string().max(10_000),
        returnValue: valueSchema.optional(),
        callName: z.string().max(120).optional(),
      }),
    )
    .max(400),
  error: z.string().max(2000).nullable(),
  stdout: z.string().max(10_000),
});

/** Treat worker results as untrusted data before the visualizer traverses them. */
export function parsePythonTrace(raw: string) {
  if (raw.length > 2_000_000) throw new Error("Python trace result is too large.");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid Python trace response.");
  }
  const result = traceSchema.safeParse(data);
  if (!result.success) throw new Error("Invalid Python trace response.");
  return result.data;
}
