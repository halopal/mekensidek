
import React, { useState, useEffect } from 'react';
import { generateDeck, generateInfographic } from './services/geminiService';
import { DeckRenderer } from './components/DeckRenderer';
import { AppStatus, Deck, FileInput, AppMode } from './types';
import { UploadCloud, FileText, X, Sparkles, AlertCircle, Layout, ImageIcon, Download, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [mode, setMode] = useState<AppMode>(AppMode.DECK);
  const [files, setFiles] = useState<FileInput[]>([]);
  const [prompt, setPrompt] = useState('');
  const [generatedDeck, setGeneratedDeck] = useState<Deck | null>(null);
  const [generatedInfographic, setGeneratedInfographic] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // File handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileInput[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
           alert(`File ${file.name} is too large. Max 5MB.`);
           continue;
        }

        const reader = new FileReader();
        const filePromise = new Promise<FileInput>((resolve) => {
          reader.onload = (ev) => {
             const base64 = (ev.target?.result as string).split(',')[1];
             resolve({
               name: file.name,
               type: file.type,
               data: base64
             });
          };
          reader.readAsDataURL(file);
        });

        newFiles.push(await filePromise);
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0 && prompt.length < 10) {
      setErrorMsg("Please provide files or a detailed prompt to start.");
      return;
    }
    
    // We are using Gemini 2.5 Flash / Flash Image which are standard tier models.
    // Explicit API Key selection (billing check) is not strictly required here.

    setErrorMsg(null);
    setStatus(AppStatus.ANALYZING);

    try {
      if (mode === AppMode.DECK) {
        // Step 1: Analyze & Generate Structure
        const deck = await generateDeck(files, prompt);
        setGeneratedDeck(deck);
      } else {
        // Step 2: Generate Infographic
        const imageUrl = await generateInfographic(files, prompt);
        setGeneratedInfographic(imageUrl);
      }
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setFiles([]);
    setPrompt('');
    setGeneratedDeck(null);
    setGeneratedInfographic(null);
  };

  const handleBack = () => {
    setStatus(AppStatus.IDLE);
    setGeneratedDeck(null);
    setGeneratedInfographic(null);
  }

  // View: Generated Deck
  if (status === AppStatus.COMPLETE && generatedDeck) {
    return <DeckRenderer deck={generatedDeck} onBack={handleBack} />;
  }

  // View: Generated Infographic
  if (status === AppStatus.COMPLETE && generatedInfographic) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col transition-colors duration-200">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center shadow-sm z-10 transition-colors">
          <button onClick={handleBack} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-mbb-navy dark:hover:text-blue-300 transition flex items-center gap-1">
             &larr; Editor
          </button>
          <div className="text-sm font-bold text-mbb-navy dark:text-white">Executive Infographic</div>
          <div className="flex items-center gap-4">
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
               {darkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <a 
               href={generatedInfographic} 
               download="infographic.png"
               className="flex items-center gap-2 px-3 py-1.5 bg-mbb-navy hover:bg-slate-800 text-white text-xs font-medium rounded-md transition shadow-sm"
             >
                <Download size={14} /> Download PNG
             </a>
          </div>
        </div>
        <div className="flex-1 p-8 flex justify-center items-center overflow-auto">
          <img 
            src={generatedInfographic} 
            alt="Generated Infographic" 
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800"
          />
        </div>
      </div>
    );
  }

  // View: Loading
  if (status === AppStatus.ANALYZING || status === AppStatus.GENERATING) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center transition-colors">
          <div className="relative w-16 h-16 mx-auto mb-6">
             <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-mbb-navy dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
             <Sparkles className="absolute inset-0 m-auto text-mbb-teal dark:text-teal-400 animate-pulse" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {mode === AppMode.DECK ? "Consulting AI is thinking..." : "Designing Infographic..."}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {mode === AppMode.DECK 
              ? "Applying Pyramid Principle • Synthesizing Data • Designing Slides"
              : "Analyzing Documents • Visualizing Data • Rendering Graphics"}
          </p>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-mbb-teal dark:bg-teal-500 animate-progress-indeterminate"></div>
          </div>
        </div>
      </div>
    );
  }

  // View: Input / Dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mbb-navy dark:bg-blue-600 rounded-sm flex items-center justify-center text-white font-serif font-bold">S</div>
            <span className="font-semibold text-lg tracking-tight dark:text-white">StrategyDeck.ai</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden sm:block">McKinsey-Style Generator</div>
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
               {darkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-mbb-navy dark:text-blue-50 mb-4 transition-colors">
            Turn Chaos Into Clarity.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto transition-colors">
            Upload raw documents, reports, or notes. Our AI Consultant synthesizes them into executive-ready assets.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm inline-flex transition-colors">
            <button 
              onClick={() => setMode(AppMode.DECK)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.DECK 
                  ? 'bg-mbb-navy text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Layout size={16} /> Presentation Deck
            </button>
            <button 
              onClick={() => setMode(AppMode.INFOGRAPHIC)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.INFOGRAPHIC 
                  ? 'bg-mbb-navy text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ImageIcon size={16} /> Infographic
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          {/* Section 1: Upload */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 transition-colors">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">1. Knowledge Base</h2>
            
            <div className="relative group">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                accept=".pdf,.txt,.md,image/png,image/jpeg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center group-hover:border-mbb-teal dark:group-hover:border-teal-500 group-hover:bg-teal-50/30 dark:group-hover:bg-teal-900/10 transition-all">
                <UploadCloud className="text-mbb-slate dark:text-gray-400 mb-3 group-hover:text-mbb-teal dark:group-hover:text-teal-400" size={32} />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, TXT (Max 5MB)</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200">
                    <FileText size={12} />
                    <span className="truncate max-w-[150px]">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="hover:text-red-500"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Context */}
          <div className="p-8 transition-colors">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">2. Context & Objectives</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Analyze the attached Q3 financial report. Focus on the decline in European markets and propose 3 strategic initiatives for Q4. The audience is the Board of Directors."
              className="w-full h-32 p-4 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mbb-teal focus:border-transparent outline-none resize-none bg-mbb-navy text-white placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="bg-gray-50 dark:bg-gray-900 px-8 py-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 transition-colors">
             <div className="flex flex-col">
                <span className="text-xs text-gray-400 dark:text-gray-500">Powered by Gemini 2.5 Flash</span>
             </div>
             <button 
                onClick={handleGenerate}
                disabled={files.length === 0 && prompt.length === 0}
                className="bg-mbb-navy hover:bg-slate-800 text-white px-6 py-2.5 rounded-md font-medium text-sm transition shadow-lg shadow-blue-900/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Sparkles size={16} /> 
               {mode === AppMode.DECK ? 'Generate Deck' : 'Generate Infographic'}
             </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-center gap-3 border border-red-100 dark:border-red-900/30">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
