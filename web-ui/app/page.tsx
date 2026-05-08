"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, Download, CheckCircle, Loader2, BrainCircuit } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState(""); 
  
  // Chat States
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  // FUNCTION 1: Handles AI Summarization & Progress Tracking
  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setSummary("");
    setChatHistory([]); // Reset chat for new file
    setStatus("📂 Reading PDF and splitting into chunks...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const interval = setInterval(() => {
        setStatus((prev) => {
          if (prev.includes("Reading")) return "🧠 Analyzing Chunk 1... (Initiating Gemini)";
          if (prev.includes("Chunk 1")) return "🧠 Analyzing Chunk 2... Gemini is thinking";
          if (prev.includes("Chunk 2")) return "🧠 Processing further sections... almost there";
          if (prev.includes("sections")) return "🧠 Synthesizing final report...";
          return prev;
        });
      }, 12000);

      const response = await fetch("https://neuralleaf-ai-pdf-summarizer.onrender.com", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      clearInterval(interval);
      
      if (data.summary) {
        setSummary(data.summary);
        setStatus("✅ Synthesis Complete");
      } else {
        setSummary("⚠️ Error: " + (data.error || "Unknown error"));
        setStatus("❌ Failed");
      }
    } catch (err) {
      setStatus("❌ Connection Error");
      setSummary("❌ Connection Failed: Run 'python -m src.api_bridge' in your other terminal!");
    } finally {
      setLoading(false);
    }
  };

  // FUNCTION 2: Handles PDF Export
  const handleDownload = async () => {
    if (!summary) return;
    try {
      const response = await fetch("http://127.0.0.1:8000/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "NeuralLeaf_Analysis.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Could not generate PDF. Check if backend is running.");
    }
  };

  // FUNCTION 3: Handles Chat with PDF
  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      
      if (data.answer) {
        setChatHistory((prev) => [...prev, { q: question, a: data.answer }]);
        setQuestion(""); 
      } else {
        alert(data.error || "Chat failed");
      }
    } catch (err) {
      alert("Chat failed. Check if backend is running.");
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
        .action-btn:hover { background: #059669; }
        .action-btn:disabled { background: #1F2328; color: #4B5563; cursor: not-allowed; }
        .chat-input { flex: 1; background: #1F2328; border: 1px solid #23272B; border-radius: 12px; padding: 12px 15px; color: white; outline: none; }
        .chat-input:focus { border-color: #10B981; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="main-wrapper">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrainCircuit size={32} className="emerald-leaf" />
            <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: '-1px' }}>NEURAL<span className="emerald-leaf">LEAF</span></h2>
          </div>
          <span style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '2px' }}>PROTOCOL v2.5</span>
        </header>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '20px' }}>
            Transmute data <br /> into <span className="emerald-leaf">wisdom.</span>
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1.1rem' }}>Our neural engine distills complex PDFs into precise intelligence reports.</p>
        </div>

        <div className="glass-box shadow-2xl">
          <div className="drop-zone">
            <input 
              type="file" accept=".pdf" 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div style={{ background: file ? '#10B981' : '#1F2328', color: file ? '#0B0D0F' : '#6B7280', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '15px' }}>
              {file ? <FileText size={32} /> : <Upload size={32} />}
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: file ? 'white' : '#9CA3AF' }}>
              {file ? file.name : "Drop your research document"}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '8px' }}>PDF format (max 25MB)</p>
          </div>

          <button className="action-btn" onClick={handleSummarize} disabled={!file || loading}>
            {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={20} />}
            {loading ? "PROCESSING..." : "GENERATE SUMMARY"}
          </button>

          {loading && (
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <p style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 700 }}>{status}</p>
              <div style={{ width: '100%', height: '6px', background: '#1F2328', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' }}>
                <motion.div initial={{ width: "0%" }} animate={{ width: "95%" }} transition={{ duration: 60, ease: "linear" }} style={{ height: '100%', background: '#10B981' }} />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {summary && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-box" style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #23272B', paddingBottom: '15px', marginBottom: '20px' }}>
                <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> SYNTHESIS COMPLETE
                </span>
                <button onClick={handleDownload} className="text-slate-500 hover:text-[#10B981] transition-colors p-2" title="Download PDF">
                  <Download size={20} />
                </button>
              </div>
              
              <div style={{ color: '#D1D5DB', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '25px' }}>
                {summary}
              </div>

              {/* CHAT SECTION */}
              <div style={{ marginTop: '40px', borderTop: '1px solid #23272B', paddingTop: '30px' }}>
                <h3 style={{ color: '#10B981', fontSize: '1rem', marginBottom: '20px', fontWeight: 'bold' }}>Deep Context Chat</h3>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                  <input 
                    type="text" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="Ask a specific question about the PDF..."
                    className="chat-input"
                  />
                  <button 
                    onClick={handleAsk}
                    disabled={isAsking || !question.trim()}
                    style={{ background: '#10B981', color: '#0B0D0F', padding: '0 25px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isAsking ? <Loader2 className="animate-spin" /> : "Ask"}
                  </button>
                </div>

                {chatHistory.map((chat, i) => (
                  <div key={i} style={{ marginBottom: '20px', borderLeft: '2px solid #10B981', paddingLeft: '15px' }}>
                    <p style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>YOU: {chat.q}</p>
                    <p style={{ color: '#D1D5DB', fontSize: '0.95rem', background: '#1F2328', padding: '12px', borderRadius: '8px' }}>{chat.a}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '30px', borderTop: '1px solid #23272B', paddingTop: '20px' }}>
                <button 
                  onClick={() => { setSummary(""); setFile(null); setStatus(""); setChatHistory([]); }}
                  className="text-xs uppercase tracking-widest text-slate-500 hover:text-[#10B981] font-bold"
                >
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