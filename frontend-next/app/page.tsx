"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, ShieldAlert, Cpu } from "lucide-react";

// Mock volume data for Recharts visualization
const volumeData = [
  { time: "09:30", vol: 400 },
  { time: "10:00", vol: 300 },
  { time: "10:30", vol: 600 },
  { time: "11:00", vol: 800 },
  { time: "11:30", vol: 500 },
  { time: "12:00", vol: 1100 },
  { time: "12:30", vol: 700 },
];

export default function MissionControl() {
  const [guardrails, setGuardrails] = useState({
    max_trade_amount: 1000.0,
    allowed_tickers: ["AAPL", "TSLA"],
  });
  // Mock logs state
  const [logs, setLogs] = useState<any[]>([
    { id: "1", time: "12:34:01", status: "BLOCKED", action: "BUY", ticker: "DOGE", amount: 50000, reason: "Unauthorized Ticker" },
    { id: "2", time: "12:32:14", status: "ALLOWED", action: "BUY", ticker: "AAPL", amount: 500, reason: "Compliant" },
    { id: "3", time: "12:30:00", status: "QUARANTINED", action: "BUY", ticker: "TSLA", amount: 950, reason: "Near Limit" },
  ]);

  const handleDispatch = (type: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    if (type === 'normal') {
      setLogs(prev => [{ id: Date.now().toString(), time, status: "ALLOWED", action: "BUY", ticker: "AAPL", amount: 400, reason: "Compliant" }, ...prev]);
    } else if (type === 'attack') {
      setLogs(prev => [{ id: Date.now().toString(), time, status: "BLOCKED", action: "BUY", ticker: "DOGE", amount: 55000, reason: "Exceeds Limits & Ticker" }, ...prev]);
    } else if (type === 'shadow') {
      setLogs(prev => [{ id: Date.now().toString(), time, status: "QUARANTINED", action: "BUY", ticker: "TSLA", amount: 980, reason: "Shadow Mode Active" }, ...prev]);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b-[4px] border-terracotta-500 pb-4 mb-8">
        <div className="flex items-center gap-4">
          <Shield className="w-12 h-12 text-terracotta-500" strokeWidth={2.5} />
          <h1 className="text-4xl font-bold text-white tracking-widest stepped-text-shadow uppercase">
            IntentShield
          </h1>
        </div>
        <div className="flex items-center gap-3 border-[2px] border-terracotta-500 bg-panel px-4 py-2 shadow-block shadow-terracotta-500">
          <div className="w-3 h-3 bg-green-400 rounded-none shadow-[0_0_8px_#39ff14] animate-pulse"></div>
          <span className="text-green-400 font-bold tracking-widest text-sm">SYSTEM ONLINE</span>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-8">
        {/* POLICY CONTROL CENTER */}
        <section className="col-span-5 bg-panel p-6 segmented-border shadow-block shadow-terracotta-500 flex flex-col gap-6">
          <h2 className="text-xl font-bold flex items-center gap-3 text-terracotta-500 uppercase border-b-2 border-[#2b2b2b] pb-2">
            <Cpu className="w-6 h-6" /> Policy Control Center
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 uppercase">Max Trade Amount ($)</label>
              <input 
                type="number" 
                defaultValue={guardrails.max_trade_amount}
                className="w-full bg-black border-2 border-border p-3 text-white focus:outline-none focus:border-terracotta-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 uppercase">Allowed Tickers</label>
              <input 
                type="text" 
                defaultValue={guardrails.allowed_tickers.join(", ")}
                className="w-full bg-black border-2 border-border p-3 text-white focus:outline-none focus:border-terracotta-500 transition-colors"
              />
            </div>
            
            <button className="w-full mt-4 bg-terracotta-500 text-black font-bold uppercase tracking-widest py-3 border-2 border-terracotta-500 shadow-block shadow-terracotta-400 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all active:bg-terracotta-400">
              Update Core Shield
            </button>
          </div>

          <div className="mt-6 border-t-2 border-[#2b2b2b] pt-6">
             <h3 className="text-sm text-gray-400 mb-4 uppercase font-bold">Simulator Dispatch</h3>
             <div className="flex flex-col gap-3">
               <button onClick={() => handleDispatch('normal')} className="bg-transparent border-2 border-green-400 text-green-400 py-2 hover:bg-green-400 hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-block-sm shadow-green-400 hover:shadow-none transition-all">Normal Trade</button>
               <button onClick={() => handleDispatch('attack')} className="bg-transparent border-2 border-terracotta-500 text-terracotta-500 py-2 hover:bg-terracotta-500 hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-block-sm shadow-terracotta-500 hover:shadow-none transition-all">Inject Malicious Prompt</button>
               <button onClick={() => handleDispatch('shadow')} className="bg-transparent border-2 border-yellow-500 text-yellow-500 py-2 hover:bg-yellow-500 hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-block-sm shadow-yellow-500 hover:shadow-none transition-all">Trigger Shadow Mode</button>
             </div>
          </div>
        </section>

        {/* VISUALIZATIONS */}
        <section className="col-span-7 bg-panel p-6 segmented-border shadow-block shadow-terracotta-500 flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-3 text-terracotta-500 uppercase border-b-2 border-[#2b2b2b] pb-2 mb-6">
            <ShieldAlert className="w-6 h-6" /> Trade Volume (Recharts)
          </h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <XAxis dataKey="time" stroke="#8b949e" tick={{fontFamily: 'monospace', fontSize: 12}} />
                <YAxis stroke="#8b949e" tick={{fontFamily: 'monospace', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#2b2b2b'}} 
                  contentStyle={{ backgroundColor: '#16181b', border: '2px solid #D9836C', borderRadius: '0', fontFamily: 'monospace' }} 
                />
                <Bar dataKey="vol" fill="#D9836C" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* LIVE AUDIT STREAM (JSON) */}
        <section className="col-span-12 bg-panel p-6 border-l-[6px] border-l-terracotta-500 shadow-block shadow-border">
          <h2 className="text-xl font-bold text-terracotta-500 uppercase mb-4 tracking-widest">
            {'>_'} Live Audit Stream
          </h2>
          <div className="bg-black border-2 border-[#2b2b2b] p-4 h-[300px] overflow-y-auto font-mono text-sm">
            {logs.map((log) => {
              const LogColor = log.status === "ALLOWED" ? "text-green-400" : log.status === "BLOCKED" ? "text-terracotta-500" : "text-yellow-500";
              
              return (
                <div key={log.id} className="mb-4 border-b border-[#1f2124] pb-2">
                  <span className="text-gray-500 mr-4">[{log.time}]</span>
                  <span className={`${LogColor} font-bold mr-4`}>{log.status}</span>
                  <span className="text-gray-300">
                    {`{"action": "${log.action}", "ticker": "${log.ticker}", "amount": ${log.amount}} `}
                  </span>
                  <span className="text-gray-500 ml-4">// {log.reason}</span>
                </div>
              );
            })}
            <div className="text-gray-600 animate-pulse mt-2">_ awaiting agent payloads...</div>
          </div>
        </section>
      </main>
    </div>
  );
}
