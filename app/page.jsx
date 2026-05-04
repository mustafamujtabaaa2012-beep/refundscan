""use client";
import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, DollarSign, FileText, ArrowRight } from 'lucide-react';

export default function RefundDashboard() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const LEMON_CHECKOUT_URL = "https://lemonsqueezy.com";

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">R</div>
            <span className="text-xl font-bold tracking-tight">Refund<span className="text-blue-500">Scan</span></span>
          </div>
          <button className="text-sm font-medium hover:text-blue-400 transition-colors">Documentation</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
            Recover Your Amazon Losses.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Upload your Refund and Inventory reports. Our AI identifies unreturned items 
            that Amazon owes you money for—in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Upload Card */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm hover:border-slate-700 transition-all group">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Upload Reports</h3>
            <p className="text-slate-400 mb-6 text-sm">Select both Refund_Report.csv and Inventory_Ledger.csv</p>
            <input type="file" multiple className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
            <button className="w-full mt-6 bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
              Start Analysis <ArrowRight size={18} />
            </button>
          </div>

          {/* Real-time Status Card */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-center items-center text-center">
             {!results ? (
               <>
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <FileText className="text-slate-600" />
                </div>
                <p className="text-slate-500 italic">Waiting for files...</p>
               </>
             ) : (
               <div className="w-full space-y-6 text-left">
                  <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                    <span className="text-green-500 font-medium">Potential Refund</span>
                    <span className="text-2xl font-bold text-green-400">$1,420.50</span>
                  </div>
                  <button onClick={() => window.location.href = LEMON_CHECKOUT_URL} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                    Claim Full Report Now
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <CheckCircle2 className="text-green-500" />, title: "Accurate Data", desc: "Cross-references SKU & Order IDs." },
            { icon: <DollarSign className="text-blue-500" />, title: "Instant ROI", desc: "Find lost money in under 60 seconds." },
            { icon: <AlertCircle className="text-yellow-500" />, title: "Safe & Secure", desc: "We don't store your sensitive data." }
          ].map((f, i) => (
            <div key={i} className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl">
              <div className="mb-3">{f.icon}</div>
              <h4 className="font-bold text-white mb-1">{f.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-12 text-slate-600 text-xs border-t border-slate-900 mt-12">
        © 2024 RefundScan AI. Built for Amazon Sellers.
      </footer>
    </div>
  );
}
