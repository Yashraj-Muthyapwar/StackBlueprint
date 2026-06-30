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
import sys, io, json, builtins

MAX_STEPS = 400
MAX_COLL = 50
MAX_STR = 120

def _run_traced(src):
    snapshots = []
    stdout_buf = io.StringIO()

    code = compile(src, "<user>", "exec")
    user_globals = {"__name__": "__main__", "__builtins__": builtins}

    def ser(v, heap):
        if v is None or isinstance(v, bool):
            return {"kind":"prim","type":type(v).__name__,"value":repr(v)}
        if isinstance(v, (int, float)):
            return {"kind":"prim","type":type(v).__name__,"value":v}
        if isinstance(v, str):
            s = v if len(v) <= MAX_STR else v[:MAX_STR] + "…"
            return {"kind":"prim","type":"str","value":repr(s)}
        oid = str(id(v))
        if oid in heap:
            return {"kind":"ref","id":oid}
        # placeholder for cycles
        heap[oid] = {"type": type(v).__name__, "items": []}
        try:
            if isinstance(v, list):
                items = [ser(x, heap) for x in list(v)[:MAX_COLL]]
                heap[oid] = {"type":"list","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            elif isinstance(v, tuple):
                items = [ser(x, heap) for x in list(v)[:MAX_COLL]]
                heap[oid] = {"type":"tuple","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            elif isinstance(v, set):
                items = [ser(x, heap) for x in list(v)[:MAX_COLL]]
                heap[oid] = {"type":"set","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            elif isinstance(v, dict):
                items = []
                for i,(k,val) in enumerate(v.items()):
                    if i >= MAX_COLL: break
                    items.append([ser(k, heap), ser(val, heap)])
                heap[oid] = {"type":"dict","items":items,"truncated":len(v)>MAX_COLL,"size":len(v)}
            else:
                heap[oid] = {"type": type(v).__name__, "repr": repr(v)[:MAX_STR]}
        except Exception as e:
            heap[oid] = {"type": type(v).__name__, "repr": "<unrepr: %s>" % e}
        return {"kind":"ref","id":oid}

    def snapshot(event, frame, arg=None):
        if len(snapshots) >= MAX_STEPS:
            raise RuntimeError("Step limit reached (%d). Simplify the program." % MAX_STEPS)
        heap = {}
        frames = []
        f = frame
        while f is not None and f.f_code.co_filename == "<user>":
            locs = {}
            for k, val in list(f.f_locals.items()):
                if k.startswith("__"): continue
                try:
                    locs[k] = ser(val, heap)
                except Exception:
                    locs[k] = {"kind":"prim","type":"?","value":"<unser>"}
            frames.append({
                "name": "<module>" if f.f_code.co_name == "<module>" else f.f_code.co_name,
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
            snap["callName"] = "<module>" if frame.f_code.co_name == "<module>" else frame.f_code.co_name
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
        err = "%s: %s" % (type(e).__name__, e)
    finally:
        sys.stdout = real_stdout

    return json.dumps({"snapshots": snapshots, "error": err, "stdout": stdout_buf.getvalue()})
`;
