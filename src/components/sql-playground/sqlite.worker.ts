// Use importScripts to load sql.js directly from the public directory.
// This completely bypasses Vite/Rolldown module resolution bugs in Web Workers.
importScripts("/sql/sql-wasm.js");

declare let initSqlJs: any;

let sqlite: any = null;
let db: any = null;

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;
  try {
    if (!sqlite) {
      sqlite = await initSqlJs({
        // Point directly to the wasm file in the public directory
        locateFile: (file: string) => `/sql/${file}`,
      });
    }

    if (type === "inspect") {
      const buffer = payload as ArrayBuffer;
      db = new sqlite.Database(new Uint8Array(buffer));

      const res = db.exec(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
      `);

      let tables: string[] = [];
      if (res.length > 0) {
        tables = res[0].values.map((v: any) => String(v[0]));
      }
      self.postMessage({ id, status: "success", tables });
    } else if (type === "extract") {
      const tableName = payload as string;
      if (!db) throw new Error("Database not loaded in worker");

      const res = db.exec(`SELECT * FROM "${tableName}"`);
      if (res.length === 0) {
        self.postMessage({ id, status: "success", csv: "" });
        return;
      }

      const columns = res[0].columns;
      const values = res[0].values;

      const escape = (val: any) => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      let csv = columns.map(escape).join(",") + "\n";
      for (const row of values) {
        csv += row.map(escape).join(",") + "\n";
      }

      self.postMessage({ id, status: "success", csv });
    }
  } catch (err: any) {
    self.postMessage({ id, status: "error", error: err.message || String(err) });
  }
};
