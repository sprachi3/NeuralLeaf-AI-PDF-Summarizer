"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, Download, CheckCircle, Loader2, BrainCircuit, Clock, RotateCcw } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState(""); 
  const [showWakeUpWarning, setShowWakeUpWarning] = useState(false);
  
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  // PRODUCTION API URL
  const API_BASE = "https://neuralleaf-ai-pdf-summarizer.onrender.com";

  const handleClear = () => {
    setFile(null);
    setSummary("");
    setChatHistory([]);
    setStatus("");
    setQuestion("");
    setShowWakeUpWarning(false);
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setSummary("");
    setChatHistory([]);
    setStatus("📂 Reading PDF and splitting into chunks...");
    setShowWakeUpWarning(false);

    const wakeUpTimer = setTimeout(() => setShowWakeUpWarning(true), 5000);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/summarize`, {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      clearTimeout(wakeUpTimer);
      setShowWakeUpWarning(false);
      
      if (data.summary) {
        setSummary(data.summary);
        setStatus("✅ Synthesis Complete");
      } else {
        setSummary("⚠️ Error: " + (data.error || "Unknown error"));
        setStatus("❌ Failed");
      }
    } catch (err) {
      clearTimeout(wakeUpTimer);
      setShowWakeUpWarning(false);
      setStatus("❌ Connection Error");
      setSummary("❌ Server is starting up. Please refresh and try again in 1 minute.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!summary) return;
    try {
      const response = await fetch(`${API_BASE}/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "NeuralLeaf_Analysis.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Could not generate PDF. Server might be sleeping.");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (data.answer) {
        setChatHistory((prev) => [...prev, { q: question, a: data.answer }]);
        setQuestion(""); 
      }
    } catch (err) {
      alert("Chat failed. Server might be sleeping.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0B0D0F', minHeight: '100vh', color: '#E0E0E0', padding: '40px 20px' }}>
      <style>{`
        .main-wrapper { max-width: 800px; margin: 0 auto; }
        .emerald-leaf { color: #10B981; }
        .glass-box { background: #15181C; border: 1px solid #23272B; border-radius: 24px; padding: 40px; margin-top: 40px; }
        .drop-zone { border: 2px dashed #23272B; border-radius: 20px; padding: 60px 20px; text-align: center; cursor: pointer; transition: 0.3s; position: relative; }
        .drop-zone:hover { border-color: #10B981; background: rgba(16, 185, 129, 0.03); }
        .action-btn { width: 100%; background: #10B981; color: #0B0D0F; border: none; border-radius: 16px; height: 64px; font-weight: 900; font-size: 1.1rem; cursor: pointer; margin-top: 30px; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .chat-input { flex: 1; background: #1F2328; border: 1px solid #23272B; border-radius: 12px; padding: 12px 15px; color: white; outline: none; }
        .warning-msg { background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; border-radius: 12px; padding: 15px; margin-top: 20px; display: flex; align-items: center; gap: 10px; color: #10B981; font-size: 0.85rem; }
        .clear-link { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; border: none; background: none; transition: 0.2s; margin-top: 30px; }
        .clear-link:hover { color: #10B981; }
      `}</style>

      <div className="main-wrapper">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrainCircuit size={32} className="emerald-leaf" />
            <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: '-1px' }}>NEURAL<span className="emerald-leaf">LEAF</span></h2>
          </div>
          <span style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '2px' }}>PROTOCOL v2.5</span>
        </header>

        <div className="glass-box shadow-2xl">
          <div className="drop-zone">
            <input type="file" accept=".pdf" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div style={{ background: file ? '#10B981' : '#1F2328', color: file ? '#0B0D0F' : '#6B7280', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '15px' }}>
              {file ? <FileText size={32} /> : <Upload size={32} />}
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{file ? file.name : "Drop your research document"}</p>
          </div>

          <button className="action-btn" onClick={handleSummarize} disabled={!file || loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? "PROCESSING..." : "GENERATE SUMMARY"}
          </button>

          {showWakeUpWarning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="warning-msg">
              <Clock size={18} />
              <span>The server is waking up from sleep. Please wait about 1 minute...</span>
            </motion.div>
          )}

          {loading && (
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <p style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 700 }}>{status}</p>
              <div style={{ width: '100%', height: '6px', background: '#1F2328', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' }}>
                <motion.div initial={{ width: "0%" }} animate={{ width: "95%" }} transition={{ duration: 60 }} style={{ height: '100%', background: '#10B981' }} />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {summary && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #23272B', paddingBottom: '15px', marginBottom: '20px' }}>
                <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> SYNTHESIS COMPLETE
                </span>
                <button onClick={handleDownload} className="text-slate-500 hover:text-[#10B981]"><Download size={20} /></button>
              </div>
              <div style={{ color: '#D1D5DB', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '25px' }}>{summary}</div>
              
              <div style={{ marginTop: '40px', borderTop: '1px solid #23272B', paddingTop: '30px' }}>
                <h3 style={{ color: '#10B981', marginBottom: '20px', fontWeight: 'bold' }}>Deep Context Chat</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                  <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAsk()} placeholder="Ask a specific question..." className="chat-input" />
                  <button onClick={handleAsk} disabled={isAsking} style={{ background: '#10B981', padding: '0 25px', borderRadius: '12px', color: '#0B0D0F', fontWeight: 'bold' }}>
                    {isAsking ? <Loader2 className="animate-spin" /> : "Ask"}
                  </button>
                </div>
                {chatHistory.map((chat, i) => (
                  <div key={i} style={{ marginBottom: '20px', borderLeft: '2px solid #10B981', paddingLeft: '15px' }}>
                    <p style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold' }}>YOU: {chat.q}</p>
                    <p style={{ color: '#D1D5DB', background: '#1F2328', padding: '12px', borderRadius: '8px', marginTop: '5px' }}>{chat.a}</p>
                  </div>
                ))}
              </div>

              {/* RESTORED CLEAR BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="clear-link" onClick={handleClear}>
                  <RotateCcw size={14} />
                  Clear Session & New Upload
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}