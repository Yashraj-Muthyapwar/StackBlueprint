import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Folder,
  HardDrive,
  ArrowRight,
  Archive,
  ShieldAlert,
  FileType2,
  Search,
  Trash2,
  Replace,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  FastForward,
  Cpu,
  FileDown,
  Box,
  ArchiveRestore,
  Sparkles,
  XCircle,
  RotateCcw,
  Database,
} from "lucide-react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export function ShutilModuleCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 6;

  // Timings for each step
  const STEP_DURATIONS = [5000, 6000, 4500, 5000, 4500, 5000];

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % totalSteps),
      STEP_DURATIONS[step] || 4000,
    );
    return () => window.clearTimeout(id);
  }, [playing, step, isHovered]);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + totalSteps) % totalSteps);
    },
    [totalSteps],
  );

  const getPhaseName = () => {
    switch (step) {
      case 0:
        return "copy2()";
      case 1:
        return "copytree()";
      case 2:
        return "move()";
      case 3:
        return "make_archive()";
      case 4:
        return "copyfileobj()";
      case 5:
        return "rmtree()";
      default:
        return "";
    }
  };

  return (
    <div
      className="flex flex-col relative z-10 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-4 py-8 lg:px-8 lg:py-10 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step0Copy2 key="step0" />}
          {step === 1 && <Step1CopyTree key="step1" />}
          {step === 2 && <Step2Move key="step2" />}
          {step === 3 && <Step3Archive key="step3" />}
          {step === 4 && <Step4FileObj key="step4" />}
          {step === 5 && <Step5RmTree key="step5" />}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded bg-surface border border-hairline text-muted-foreground shadow-sm">
            Phase: {getPhaseName()}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {step + 1} / {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Phase 1: copy2()
// ----------------------------------------------------------------------
function Step0Copy2() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-violet">shutil</span>.<span className="text-sky-500">copy2</span>
        (source, backups)
      </div>
      <div className="flex justify-center items-center gap-16 w-full max-w-3xl">
        {/* Source Folder */}
        <motion.div
          layoutId="source-folder"
          className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[200px] shadow-sm relative"
        >
          <Folder className="size-8 text-sky-500 mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold mb-4">
            exports/
          </span>

          <div className="p-3 rounded-lg bg-surface-2 border border-hairline flex flex-col items-center w-full relative z-10">
            <FileText className="size-6 text-foreground mb-1" />
            <span className="text-xs font-mono">report.csv</span>
            <div className="mt-2 text-[9px] bg-violet/10 text-violet px-1.5 py-0.5 rounded flex items-center gap-1">
              <Lock className="size-2.5" /> Meta: 12:05 PM
            </div>
          </div>
        </motion.div>

        {/* Arrow */}
        <div className="flex flex-col items-center text-muted-foreground">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 60, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="h-0.5 bg-violet/50 relative"
          >
            <motion.div
              animate={{ x: [0, 60] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -ml-1 text-violet"
            >
              <ArrowRight className="size-3" />
            </motion.div>
          </motion.div>
          <span className="text-[10px] font-mono mt-2 text-violet font-bold">Copy + Meta</span>
        </div>

        {/* Dest Folder */}
        <motion.div
          layoutId="dest-folder"
          className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[200px] shadow-sm"
        >
          <Folder className="size-8 text-violet mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold mb-4">
            backups/
          </span>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="p-3 rounded-lg bg-violet/10 border border-violet/30 flex flex-col items-center w-full shadow-inner"
          >
            <FileText className="size-6 text-violet mb-1" />
            <span className="text-xs font-mono text-violet">report.csv</span>
            <div className="mt-2 text-[9px] bg-violet/20 text-violet px-1.5 py-0.5 rounded flex items-center gap-1">
              <Lock className="size-2.5" /> Meta: 12:05 PM
            </div>
          </motion.div>
        </motion.div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-md text-center">
        <code className="bg-surface-2 px-1 rounded">copy2()</code> creates an exact duplicate,
        preserving timestamps and file metadata where the platform allows.
      </p>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Phase 2: copytree()
// ----------------------------------------------------------------------
function Step1CopyTree() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 font-mono text-sm shadow-sm w-full max-w-xl text-center">
        <span className="text-emerald-500">shutil</span>.
        <span className="text-sky-500">copytree</span>(src, dst,{" "}
        <span className="text-amber">ignore</span>=
        <span className="text-emerald-500">ignore_patterns</span>(
        <span className="text-amber">'*.tmp'</span>))
      </div>

      <div className="flex justify-center items-center gap-12 w-full max-w-4xl relative">
        {/* Source Folder */}
        <motion.div
          layoutId="source-folder"
          className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[200px] shadow-sm"
        >
          <Folder className="size-8 text-sky-500 mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold mb-4">
            release_source/
          </span>

          <div className="flex flex-col gap-2 w-full">
            <div className="p-2 rounded bg-surface-2 border border-hairline flex items-center gap-2">
              <FileText className="size-4" />{" "}
              <span className="text-[10px] font-mono">summary.txt</span>
            </div>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 relative z-20"
            >
              <FileType2 className="size-4 text-rose-500" />{" "}
              <span className="text-[10px] font-mono text-rose-500">draft.tmp</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Ignore Filter Wall */}
        <div className="flex flex-col items-center relative h-full">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 120, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-1 bg-gradient-to-b from-transparent via-amber/50 to-transparent absolute top-1/2 -translate-y-1/2 rounded-full"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border-2 border-amber rounded-full p-2 z-10 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
          >
            <ShieldAlert className="size-5 text-amber" />
          </motion.div>
        </div>

        {/* Dest Folder */}
        <motion.div
          layoutId="dest-folder"
          className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center min-w-[200px] shadow-sm"
        >
          <Folder className="size-8 text-emerald-500 mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-semibold mb-4">
            staging/
          </span>

          <div className="flex flex-col gap-2 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2"
            >
              <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />{" "}
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                summary.txt
              </span>
            </motion.div>

            {/* Ignored slot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1.5 }}
              className="p-2 rounded border border-dashed border-muted-foreground flex items-center justify-center gap-2 h-[34px]"
            >
              <XCircle className="size-3 text-muted-foreground" />{" "}
              <span className="text-[9px] font-mono text-muted-foreground italic">Ignored</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-md text-center">
        <code className="bg-surface-2 px-1 rounded">copytree()</code> duplicates entire directories.
        Using <code className="bg-surface-2 px-1 rounded">ignore_patterns</code> filters out
        temporary files from the backup.
      </p>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Phase 3: move()
// ----------------------------------------------------------------------
function Step2Move() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-amber/30 bg-amber/5 font-mono text-sm shadow-sm w-full max-w-lg text-center">
        <span className="text-amber">shutil</span>.<span className="text-sky-500">move</span>
        (incoming, processed)
      </div>

      <div className="flex justify-center items-center gap-16 w-full max-w-3xl">
        {/* Source Folder */}
        <motion.div
          layoutId="source-folder"
          className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[200px] shadow-sm relative"
        >
          <Folder className="size-8 text-sky-500 mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold mb-4">
            incoming/
          </span>

          <div className="h-[60px] w-full flex items-center justify-center border border-dashed border-hairline rounded-lg bg-surface-2/30">
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.5, x: 100 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="p-3 rounded-lg bg-amber/10 border border-amber/30 flex flex-col items-center w-full relative z-20"
            >
              <FileText className="size-6 text-amber mb-1" />
              <span className="text-xs font-mono text-amber">batch.csv</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Dest Folder */}
        <motion.div
          layoutId="dest-folder"
          className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[200px] shadow-sm relative"
        >
          <Folder className="size-8 text-emerald-500 mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-semibold mb-4">
            processed/
          </span>

          <div className="h-[60px] w-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: -100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center w-full shadow-inner"
            >
              <FileText className="size-6 text-emerald-500 mb-1" />
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                batch.csv
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-md text-center">
        Unlike copy, <code className="bg-surface-2 px-1 rounded">move()</code> removes the original
        file. If crossing filesystems, it safely copies the data and then deletes the source.
      </p>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Phase 4: make_archive()
// ----------------------------------------------------------------------
function Step3Archive() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 font-mono text-sm shadow-sm w-full max-w-xl text-center">
        <span className="text-indigo-400">shutil</span>.
        <span className="text-sky-500">make_archive</span>(
        <span className="text-amber">'export'</span>, <span className="text-amber">'zip'</span>,
        root_dir)
      </div>

      <div className="flex justify-center items-center gap-12 w-full max-w-3xl relative">
        {/* Staging Folder */}
        <motion.div
          layoutId="source-folder"
          className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[200px] shadow-sm relative z-10"
        >
          <Folder className="size-8 text-indigo-400 mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-indigo-400 font-semibold mb-4">
            staging/
          </span>

          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="p-2 rounded bg-surface-2 border border-hairline flex justify-center">
              <FileText className="size-5" />
            </div>
            <div className="p-2 rounded bg-surface-2 border border-hairline flex justify-center">
              <FileText className="size-5" />
            </div>
            <div className="p-2 rounded bg-surface-2 border border-hairline flex justify-center">
              <FileText className="size-5" />
            </div>
            <div className="p-2 rounded bg-surface-2 border border-hairline flex justify-center">
              <FileText className="size-5" />
            </div>
          </div>
        </motion.div>

        {/* Compression Animation */}
        <div className="flex flex-col items-center text-muted-foreground z-0">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-16 h-12 flex items-center justify-center relative"
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 20, opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 1, repeat: Infinity }}
              className="absolute text-indigo-400"
            >
              <FastForward className="size-6" />
            </motion.div>
          </motion.div>
          <span className="text-[10px] font-mono mt-2 text-indigo-400 font-bold uppercase tracking-wider">
            Compress
          </span>
        </div>

        {/* Zip File */}
        <motion.div
          layoutId="dest-folder"
          className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center min-w-[200px] shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", delay: 1.2 }}
          >
            <Archive className="size-12 text-indigo-500 mb-3" />
          </motion.div>
          <span className="font-mono text-sm font-bold text-indigo-400 mb-2">export.zip</span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full flex items-center gap-1"
          >
            <Box className="size-3" /> 4 items packaged
          </motion.div>
        </motion.div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-md text-center">
        <code className="bg-surface-2 px-1 rounded">make_archive()</code> compresses an entire
        directory tree into a single shareable file like a ZIP or TAR.
      </p>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Phase 5: copyfileobj()
// ----------------------------------------------------------------------
function Step4FileObj() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-sm shadow-sm w-full max-w-lg text-center">
        <span className="text-sky-500">shutil</span>.
        <span className="text-violet">copyfileobj</span>(stream, file)
      </div>

      <div className="flex justify-center items-center gap-4 w-full max-w-3xl">
        {/* Stream */}
        <motion.div
          layoutId="source-folder"
          className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[180px] shadow-sm relative"
        >
          <Database className="size-8 text-sky-500 mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold mb-2">
            BytesIO Stream
          </span>
        </motion.div>

        {/* Pipeline / Bytes moving */}
        <div className="w-32 h-6 border-y border-sky-500/20 bg-sky-500/5 relative overflow-hidden flex items-center">
          <motion.div
            animate={{ x: [-20, 150] }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="flex gap-2 text-[10px] font-mono text-sky-400 absolute"
          >
            <span>1011</span>
            <span>0100</span>
            <span>1101</span>
          </motion.div>
        </div>

        {/* Destination File */}
        <motion.div
          layoutId="dest-folder"
          className="p-6 rounded-2xl bg-violet/10 border border-violet/30 flex flex-col items-center min-w-[180px] shadow-sm"
        >
          <FileDown className="size-8 text-violet mb-3" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold mb-2">
            Open File
          </span>
          <motion.div
            animate={{ height: [0, 40] }}
            transition={{ duration: 2, ease: "linear" }}
            className="w-16 bg-violet/20 rounded border border-violet/30 overflow-hidden"
          >
            <div className="h-full bg-violet/40" />
          </motion.div>
        </motion.div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-md text-center">
        <code className="bg-surface-2 px-1 rounded">copyfileobj()</code> pipes raw data from any
        open stream (like a download or memory buffer) directly into an open file.
      </p>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Phase 6: rmtree()
// ----------------------------------------------------------------------
function Step5RmTree() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <motion.div
        animate={{
          opacity: [1, 0.5, 1],
          scale: [1, 1.02, 1],
          borderColor: ["rgba(244,63,94,0.3)", "rgba(244,63,94,0.8)", "rgba(244,63,94,0.3)"],
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className="mb-10 p-4 rounded-xl border-2 bg-rose-500/10 font-mono text-sm shadow-[0_0_20px_rgba(244,63,94,0.2)] w-full max-w-lg text-center"
      >
        <span className="text-rose-500 font-bold">shutil</span>.
        <span className="text-rose-400">rmtree</span>(workspace)
      </motion.div>

      <div className="flex justify-center items-center w-full max-w-3xl relative">
        <motion.div
          layoutId="source-folder"
          animate={{ scale: [1, 0.95, 1.1, 0], opacity: [1, 1, 1, 0], rotate: [0, -5, 10, -15] }}
          transition={{ duration: 1, delay: 1, ease: "easeIn" }}
          className="p-8 rounded-2xl bg-surface border-2 border-rose-500/40 flex flex-col items-center min-w-[300px] shadow-sm relative z-10"
        >
          <Folder className="size-10 text-muted-foreground mb-4" />
          <span className="font-mono text-sm uppercase tracking-[0.2em] text-foreground font-semibold mb-6">
            workspace/
          </span>

          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="p-3 rounded bg-surface-2 border border-hairline flex flex-col items-center gap-1">
              <Folder className="size-4" />
              <span className="text-[9px]">/data</span>
            </div>
            <div className="p-3 rounded bg-surface-2 border border-hairline flex flex-col items-center gap-1">
              <FileText className="size-4" />
              <span className="text-[9px]">app.py</span>
            </div>
            <div className="p-3 rounded bg-surface-2 border border-hairline flex flex-col items-center gap-1">
              <FileType2 className="size-4" />
              <span className="text-[9px]">temp.log</span>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 4], opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Trash2 className="size-32 text-rose-500" />
          </motion.div>
        </motion.div>

        {/* Ash/Debris particles after explosion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: 1.8 }}
          className="absolute inset-0 flex items-center justify-center text-rose-500/50 pointer-events-none font-mono text-xs"
        >
          [ Directory Deleted ]
        </motion.div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-md text-center">
        <code className="bg-surface-2 text-rose-400 px-1 rounded">rmtree()</code> recursively and
        permanently destroys a directory and all its contents. <strong>There is no undo.</strong>
      </p>
    </motion.div>
  );
}
