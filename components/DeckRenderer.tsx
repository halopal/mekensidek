import React, { useState, useEffect } from 'react';
import { Deck, Slide, SlideLayout } from '../types';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  ChevronRight, ChevronLeft, Download, Maximize2, Monitor, Grid 
} from 'lucide-react';

interface DeckRendererProps {
  deck: Deck;
  onBack: () => void;
}

const SlideContent: React.FC<{ slide: Slide }> = ({ slide }) => {
  // Common visual components for MBB style
  const BulletList = ({ items }: { items?: string[] }) => (
    <ul className="space-y-3">
      {items?.map((item, idx) => (
        <li key={idx} className="flex items-start">
          <span className="mr-2 text-mbb-teal mt-1.5">•</span>
          <span className="text-gray-700 text-lg leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );

  switch (slide.layout) {
    case SlideLayout.TITLE:
      return (
        <div className="h-full flex flex-col justify-center items-center text-center bg-mbb-navy text-white p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-mbb-teal" />
          <h1 className="text-5xl font-serif font-bold mb-6 tracking-tight">{slide.actionTitle}</h1>
          <p className="text-xl text-gray-300 max-w-2xl">{slide.content.chartTitle || slide.content.bullets?.[0]}</p>
          <div className="absolute bottom-12 text-sm text-gray-400">
             CONFIDENTIAL • {new Date().getFullYear()}
          </div>
        </div>
      );

    case SlideLayout.BULLET_POINTS:
      return (
        <div className="h-full p-8 md:p-12 flex flex-col">
          <SlideHeader slide={slide} />
          <div className="flex-1 mt-8 bg-gray-50 p-8 border-l-4 border-mbb-slate">
            <BulletList items={slide.content.bullets} />
          </div>
        </div>
      );

    case SlideLayout.TWO_COLUMN:
      return (
        <div className="h-full p-8 md:p-12 flex flex-col">
          <SlideHeader slide={slide} />
          <div className="flex-1 mt-6 grid grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-sm">
              <h3 className="text-mbb-navy font-bold mb-4 border-b border-gray-200 pb-2 uppercase text-sm tracking-wider">Key Drivers</h3>
              <BulletList items={slide.content.leftColumn} />
            </div>
            <div className="bg-gray-50 p-6 rounded-sm">
              <h3 className="text-mbb-navy font-bold mb-4 border-b border-gray-200 pb-2 uppercase text-sm tracking-wider">Implications</h3>
              <BulletList items={slide.content.rightColumn} />
            </div>
          </div>
        </div>
      );

    case SlideLayout.CHART_BAR:
      return (
        <div className="h-full p-8 md:p-12 flex flex-col">
          <SlideHeader slide={slide} />
          <div className="flex-1 mt-4 flex flex-col">
            <h4 className="text-sm font-semibold text-gray-500 mb-2 text-center uppercase tracking-widest">{slide.content.chartTitle}</h4>
            <div className="flex-1 min-h-[300px] w-full bg-white border border-gray-100 p-4 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slide.content.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="label" type="category" width={100} stroke="#64748b" fontSize={11} tick={{fill: '#334155'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Bar dataKey="value" fill="#0F172A" barSize={20} radius={[0, 4, 4, 0]} />
                  {slide.content.chartData?.[0]?.value2 && <Bar dataKey="value2" fill="#0F766E" barSize={20} radius={[0, 4, 4, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-xs text-gray-400 italic text-right">Source: Internal Analysis; Market Data 2024</div>
          </div>
        </div>
      );

    case SlideLayout.CHART_LINE:
      return (
        <div className="h-full p-8 md:p-12 flex flex-col">
           <SlideHeader slide={slide} />
           <div className="flex-1 mt-4 flex flex-col">
            <h4 className="text-sm font-semibold text-gray-500 mb-2 text-center uppercase tracking-widest">{slide.content.chartTitle}</h4>
            <div className="flex-1 min-h-[300px] w-full bg-white border border-gray-100 p-4 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slide.content.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: '#0F766E' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
             <div className="mt-4 text-xs text-gray-400 italic text-right">Source: Projections Q1-Q4</div>
           </div>
        </div>
      );

    case SlideLayout.KPI_GRID:
      return (
         <div className="h-full p-8 md:p-12 flex flex-col">
          <SlideHeader slide={slide} />
          <div className="flex-1 mt-8 grid grid-cols-3 gap-6">
            {slide.content.kpiData?.map((kpi, i) => (
              <div key={i} className="bg-white border border-gray-200 p-6 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-mbb-navy"></div>
                <span className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-2">{kpi.label}</span>
                <span className="text-5xl font-bold text-mbb-navy my-4 block">{kpi.value}</span>
                <div className={`text-sm font-medium px-3 py-1 rounded-full ${kpi.delta.includes('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {kpi.delta} vs LY
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    default:
      return <div>Unsupported Layout</div>;
  }
};

const SlideHeader: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div className="mb-4">
    <div className="flex justify-between items-end border-b-2 border-mbb-navy pb-3 mb-4">
      <div className="max-w-[85%]">
        <div className="text-xs font-bold text-mbb-slate uppercase tracking-widest mb-1">{slide.kicker}</div>
        <h2 className="text-2xl font-bold text-mbb-navy leading-tight">{slide.actionTitle}</h2>
      </div>
      <div className="flex flex-col items-end">
         <div className="bg-gray-200 px-3 py-1 text-[10px] font-bold text-gray-600 rounded-sm uppercase tracking-wider">
           {slide.tracker}
         </div>
      </div>
    </div>
  </div>
);

export const DeckRenderer: React.FC<DeckRendererProps> = ({ deck, onBack }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const nextSlide = () => setCurrentSlideIndex(p => Math.min(p + 1, deck.slides.length - 1));
  const prevSlide = () => setCurrentSlideIndex(p => Math.max(p - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck.slides.length]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors duration-200">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center shadow-sm z-10 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-mbb-navy dark:hover:text-blue-300 transition flex items-center gap-1">
             &larr; Editor
          </button>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
          <h1 className="text-sm font-bold text-mbb-navy dark:text-white truncate max-w-xs">{deck.title}</h1>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
           <span className="text-xs mr-2 font-mono">{currentSlideIndex + 1} / {deck.slides.length}</span>
           <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"><ChevronLeft size={18} /></button>
           <button onClick={nextSlide} disabled={currentSlideIndex === deck.slides.length - 1} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deck, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href",     dataStr);
                downloadAnchorNode.setAttribute("download", "presentation.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md transition"
           >
             <Download size={14} /> Export JSON
           </button>
           <button className="flex items-center gap-2 px-3 py-1.5 bg-mbb-navy hover:bg-slate-800 text-white text-xs font-medium rounded-md transition shadow-sm">
             <Maximize2 size={14} /> Present
           </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex justify-center items-center p-8 bg-gray-200/50 dark:bg-gray-950 overflow-hidden transition-colors">
        {/* Slide Aspect Ratio 16:9 container */}
        <div className="w-full max-w-[1280px] aspect-video bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-200 dark:border-gray-800 relative transform transition-all duration-300">
          <SlideContent slide={deck.slides[currentSlideIndex]} />
          
          {/* Footer */}
          {deck.slides[currentSlideIndex].layout !== SlideLayout.TITLE && (
            <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-2">
              <span>{deck.title} • {deck.author}</span>
              <span>{currentSlideIndex + 1}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};