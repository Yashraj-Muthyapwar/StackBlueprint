import { useState } from "react";
import { motion } from "motion/react";

function BitBox({ bit, isActive, isNetwork }: { bit: string; isActive: boolean; isNetwork: boolean }) {
  const activeClass = isNetwork 
    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700/50" 
    : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50";
  
  const inactiveClass = "bg-slate-50 text-slate-400 border-hairline dark:bg-slate-800/30 dark:text-slate-500";

  return (
    <motion.div 
      layout
      className={`flex h-5 w-4 items-center justify-center rounded-[2px] border font-mono text-[10px] transition-colors sm:h-6 sm:w-5 sm:text-xs sm:rounded-sm ${isActive ? activeClass : inactiveClass}`}
    >
      {bit}
    </motion.div>
  );
}

function ipToInt(ip: string) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function intToIp(int: number) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
}

function getMask(cidr: number) {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
}

export function CidrCalculatorDiagram() {
  const [cidr, setCidr] = useState(24);
  const ip = "192.168.1.10";

  const binaryIp = "11000000.10101000.00000001.00001010"; // 192.168.1.10
  const bits = binaryIp.replace(/\./g, "").split("");
  
  const ipInt = ipToInt(ip);
  const maskInt = getMask(cidr);
  
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt)) >>> 0;
  
  const networkAddress = intToIp(networkInt);
  const broadcastAddress = intToIp(broadcastInt);
  
  let usableRange = "None";
  if (cidr === 32) {
    usableRange = "192.168.1.10 (Single Host)";
  } else if (cidr === 31) {
    usableRange = `${intToIp(networkInt)} - ${intToIp(broadcastInt)}`;
  } else {
    usableRange = `${intToIp(networkInt + 1)} - ${intToIp(broadcastInt - 1)}`;
  }

  const hostBits = 32 - cidr;
  const totalHosts = Math.pow(2, hostBits);
  const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalHosts - 2;
  
  const baseNetwork = cidr >= 16 ? 16 : 8;
  const borrowedBits = Math.max(0, cidr - baseNetwork);
  const totalSubnets = Math.pow(2, borrowedBits);

  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <figcaption className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
        <span>CIDR Breakdown (192.168.1.10/{cidr})</span>
      </figcaption>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-4 text-sm text-foreground/80">
            <p>Select a common CIDR block, or use the slider to explore how the Network and Host bits shift.</p>
            
            <div className="flex flex-wrap gap-2">
              {[
                { value: 16, label: "VPC Block" },
                { value: 24, label: "Standard Subnet" },
                { value: 27, label: "Small Subnet" },
                { value: 32, label: "Single Host" },
              ].map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setCidr(preset.value)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                    cidr === preset.value
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700/60"
                      : "bg-surface-2/40 text-muted-foreground border-hairline hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <span className="font-mono font-bold">/{preset.value}</span>
                  <span className="opacity-80">({preset.label})</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-hairline bg-surface-2/30 p-4 mt-2">
              <span className="w-12 font-mono text-lg font-medium text-emerald-600 dark:text-emerald-400">/{cidr}</span>
              <input 
                type="range" 
                min="8" 
                max="32" 
                value={cidr} 
                onChange={(e) => setCidr(parseInt(e.target.value, 10))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500 dark:bg-slate-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between gap-y-4 pb-2">
              {[0, 1, 2, 3].map(octet => (
                <div key={octet} className="flex flex-col items-center gap-2">
                  <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">Octet {octet + 1}</span>
                  <div className="flex gap-1">
                    {bits.slice(octet * 8, octet * 8 + 8).map((bit, i) => {
                      const bitIndex = octet * 8 + i;
                      const isNetwork = bitIndex < cidr;
                      return <BitBox key={i} bit={bit} isActive={true} isNetwork={isNetwork} />;
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex w-full gap-2 pt-2">
              {cidr > 0 && (
                <motion.div 
                  layout
                  className="flex items-center justify-center rounded-md border border-emerald-300 bg-emerald-50/50 py-2 font-mono text-xs sm:text-sm text-emerald-700 transition-all dark:border-emerald-700/50 dark:bg-emerald-950/20 dark:text-emerald-400 overflow-hidden whitespace-nowrap"
                  style={{ width: `${(cidr / 32) * 100}%` }}
                >
                  {cidr > 4 ? `Network (${cidr})` : cidr}
                </motion.div>
              )}
              {cidr < 32 && (
                <motion.div 
                  layout
                  className="flex items-center justify-center rounded-md border border-blue-300 bg-blue-50/50 py-2 font-mono text-xs sm:text-sm text-blue-700 transition-all dark:border-blue-700/50 dark:bg-blue-950/20 dark:text-blue-400 overflow-hidden whitespace-nowrap"
                  style={{ width: `${((32 - cidr) / 32) * 100}%` }}
                >
                  {32 - cidr > 4 ? `Host (${32 - cidr})` : 32 - cidr}
                </motion.div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-lg border border-hairline bg-surface-2/30 p-3">
              <span className="font-mono text-xs text-muted-foreground">Network Address</span>
              <span className="font-mono text-sm font-semibold text-foreground">{networkAddress}</span>
              <span className="mt-1 text-[10px] leading-tight text-muted-foreground">The very first IP address. Used by routing tables to identify the entire network. Cannot be assigned to a server.</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-hairline bg-surface-2/30 p-3">
              <span className="font-mono text-xs text-muted-foreground">Usable Host Range</span>
              <span className="font-mono text-sm font-semibold text-foreground">{usableRange}</span>
              <span className="mt-1 text-[10px] leading-tight text-muted-foreground">IPs available for assignment to devices (servers, databases, load balancers, etc).</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-hairline bg-surface-2/30 p-3">
              <span className="font-mono text-xs text-muted-foreground">Broadcast Address</span>
              <span className="font-mono text-sm font-semibold text-foreground">{broadcastAddress}</span>
              <span className="mt-1 text-[10px] leading-tight text-muted-foreground">The very last IP address. Used to send a packet to every single host in the subnet simultaneously. Cannot be assigned.</span>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-800/30 dark:bg-blue-900/10">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">CIDR Math & Formulas</h4>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-lg bg-white/80 p-3 shadow-sm border border-hairline dark:bg-slate-900/80">
                <div className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Usable Hosts = 2<sup>h</sup> - 2
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Where <code className="text-blue-600 dark:text-blue-400 font-bold">h = {hostBits}</code> (host bits).<br/>
                  We subtract 2 because the <strong>Network ID</strong> and <strong>Broadcast ID</strong> are reserved by the protocol and cannot be assigned to hosts.
                </p>
                <div className="mt-2 rounded bg-blue-100/50 px-2 py-1 font-mono text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 inline-block w-fit">
                  2<sup>{hostBits}</sup> - 2 = {usableHosts.toLocaleString()} hosts
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-lg bg-white/80 p-3 shadow-sm border border-hairline dark:bg-slate-900/80">
                <div className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Number of Subnets = 2<sup>n</sup>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Where <code className="text-emerald-600 dark:text-emerald-400 font-bold">n = {borrowedBits}</code> (borrowed bits).<br/>
                  Assuming we start with a standard <code className="font-bold">/{baseNetwork}</code> VPC, we are borrowing {borrowedBits} bits from the host portion to slice it into smaller subnets.
                </p>
                <div className="mt-2 rounded bg-emerald-100/50 px-2 py-1 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 inline-block w-fit">
                  2<sup>{borrowedBits}</sup> = {totalSubnets.toLocaleString()} subnets
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </figure>
  );
}
