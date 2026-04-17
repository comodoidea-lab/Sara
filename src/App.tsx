/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send } from 'lucide-react';
import { useAppState } from './hooks/useAppState';
import { ArcanaCard } from './components/ArcanaCard';
import { MAX_TODAY_TASKS } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'prep'>('today');
  const [stockInput, setStockInput] = useState('');
  const { state, addToStock, moveRandomToToday, completeTask, skipTask } = useAppState();

  const activeTodayTasks = useMemo(() => 
    state.todayTasks.filter(t => t.status === 'pending'), 
  [state.todayTasks]);

  const pendingTodayCount = useMemo(
    () => state.todayTasks.filter(t => t.status === 'pending').length,
    [state.todayTasks],
  );

  const stockCandidate = useMemo(() => {
    if (state.stockTasks.length === 0) return null;
    const id = state.stockCandidateId;
    if (id) {
      const found = state.stockTasks.find(t => t.id === id);
      if (found) return found;
    }
    return state.stockTasks[0];
  }, [state.stockTasks, state.stockCandidateId]);

  const handleAddStock = (e: FormEvent) => {
    e.preventDefault();
    if (!stockInput.trim()) return;
    addToStock(stockInput.trim());
    setStockInput('');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary selection:text-on-primary flex flex-col overflow-hidden relative">
      {/* Stars Background */}
      <div className="fixed inset-0 stars pointer-events-none -z-10" />

      {/* Night Timer */}
      <div className="fixed top-10 right-10 hidden md:flex items-center gap-2 font-serif text-xs text-primary/80 z-50">
        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
        <span>消滅まで 04:22:15</span>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-6 py-8 flex flex-col items-center">
        <h1 className="font-serif tracking-[0.3em] uppercase text-4xl font-light text-primary mb-2 drop-shadow-sm">
          Sara
        </h1>
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 font-sans">
          さら・今日の儀式
        </div>
      </header>

      <main className="flex-grow pt-32 pb-40 px-6 flex flex-col items-center max-w-lg mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'today' ? (
            <motion.div 
              key="today"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center"
            >
              {/* Card Container (Stage) */}
              <div className="relative w-full h-[450px] flex items-center justify-center perspective-1000">
                <AnimatePresence>
                  {activeTodayTasks.length > 0 ? (
                    activeTodayTasks.map((task, idx) => (
                      <ArcanaCard 
                        key={task.id} 
                        task={task} 
                        index={idx}
                        total={activeTodayTasks.length}
                        onComplete={() => completeTask(task.id)}
                      />
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center flex flex-col items-center gap-4 opacity-40"
                    >
                      <Sparkles size={40} strokeWidth={1} className="text-primary mb-2" />
                      <p className="font-serif italic text-lg text-primary">儀式はすべて完了しました。</p>
                      <p className="text-[11px] font-sans tracking-widest">深淵より新たなる暗示を求めてください。</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Next Candidate Bar */}
              <div className="mt-12 w-full max-w-sm">
                {pendingTodayCount < MAX_TODAY_TASKS &&
                  state.stockTasks.length > 0 &&
                  stockCandidate && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/5 border border-white/10 rounded-full px-6 py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-[11px] opacity-40 font-sans tracking-wide shrink-0">次の暗示:</span>
                      <span className="font-serif italic text-sm text-primary truncate">
                        「{stockCandidate.content}」
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => skipTask()}
                        className="text-primary/40 font-serif text-[10px] uppercase tracking-widest hover:text-primary transition-colors px-2"
                      >
                        次へ
                      </button>
                      <button 
                        type="button"
                        onClick={moveRandomToToday}
                        className="text-primary border border-primary/30 px-4 py-1.5 rounded-full font-serif text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-colors whitespace-nowrap"
                      >
                        のせる
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Stock Status Label */}
                <div className="mt-10 text-center text-[10px] opacity-30 tracking-widest font-sans">
                  深淵には {state.stockTasks.length} 件 のタスクが眠っています（3日で消滅します）
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="prep"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-12"
            >
              <div className="w-full text-center">
                <h2 className="font-serif text-3xl font-light mb-4">Stock the Well</h2>
                <p className="text-[10px] text-primary/60 font-sans tracking-[0.3em] uppercase">
                  Current Count: {state.stockTasks.length}
                </p>
              </div>

              <form onSubmit={handleAddStock} className="w-full max-w-md relative">
                <input 
                  type="text"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  placeholder="Insert a piece of your future..."
                  className="w-full bg-transparent border-b border-primary/30 p-8 text-2xl font-serif text-center outline-none focus:border-primary transition-all placeholder:text-white/5"
                />
                <button 
                  type="submit"
                  className="absolute right-4 bottom-8 p-2 text-primary hover:scale-110 transition-transform opacity-40"
                >
                  <Send size={24} />
                </button>
              </form>

              <div className="w-full max-w-xs space-y-6 opacity-30 text-center">
                <p className="font-serif italic text-xs leading-relaxed">
                  Stocks vanish into the void after 3 days.<br/>
                  Only one candidate emerges at a time.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Buttons Group */}
      <footer className="fixed bottom-12 w-full flex justify-center px-6 z-50">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab(activeTab === 'today' ? 'prep' : 'today')}
            className="bg-transparent border border-primary/30 text-primary font-serif text-xs uppercase tracking-[0.2em] px-8 py-3 rounded-full hover:bg-primary/5 transition-all"
          >
            {activeTab === 'today' ? 'ストックを追加' : '儀式へ戻る'}
          </button>
        </div>
      </footer>
    </div>
  );
}


