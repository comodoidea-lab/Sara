import React from 'react';
import { motion } from 'motion/react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface ArcanaCardProps {
  task: Task;
  onComplete: () => void;
  index: number;
  total: number;
}

export const ArcanaCard: React.FC<ArcanaCardProps> = ({ task, onComplete, index, total }) => {
  const isCompleted = task.status === 'completed';
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];
  const numeral = romanNumerals[index] || (index + 1).toString();

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    if (index !== 0 || isCompleted) return;
    if (info.offset.y < -80) {
      onComplete();
    }
  };

  return (
    <motion.div
      layout
      drag={index === 0 && !isCompleted ? 'y' : false}
      dragConstraints={{ top: -100, bottom: 0 }}
      dragElastic={0.2}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0, z: -100 }}
      animate={{ 
        scale: 1 - index * 0.08, 
        opacity: 1 - index * 0.3, 
        y: -index * 25,
        rotateX: -index * 2,
        z: -index * 50,
        zIndex: total - index,
      }}
      exit={{ 
        scale: 1.2, 
        opacity: 0, 
        y: -100,
        filter: 'brightness(2) blur(10px)',
      }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "absolute w-full max-w-[280px] h-[400px] rounded-xl border border-primary/40 flex flex-col p-6 items-center justify-center text-center overflow-hidden arcana-card-glass",
        index === 0 ? "shadow-[0_0_40px_rgba(212,175,55,0.2)]" : "pointer-events-none"
      )}
    >
      {/* Inner Border */}
      <div className="absolute inset-2 card-inner-border rounded-lg pointer-events-none" />
      
      {/* Card Content */}
      <div className="font-serif text-sm text-primary mb-10 z-10">
        {numeral}
      </div>

      <div className="flex-grow flex flex-col items-center justify-center z-10">
        <h3 className="font-serif text-2xl font-light text-white leading-relaxed mb-4">
          {task.content}
        </h3>
        {!isCompleted && (
          <p className="text-[11px] opacity-40 font-sans tracking-widest uppercase">
            今のあなたの、一番の手札。
          </p>
        )}
      </div>

      <div className="mt-auto z-10 w-full flex flex-col items-center">
        {index === 0 && !isCompleted && (
          <motion.button
            whileHover={{ scale: 1.05, background: '#d4af37', color: '#05070a' }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="border border-primary text-primary font-serif text-xs uppercase tracking-widest px-8 py-2.5 rounded-full transition-all"
          >
            完了として捧げる
          </motion.button>
        )}

        {isCompleted && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <CheckCircle2 size={32} strokeWidth={1} />
            <span className="font-serif italic text-xs">Ritual Completed</span>
          </motion.div>
        )}

        {index === 0 && !isCompleted && (
          <div className="mt-4 font-serif text-[10px] text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-1 rounded">
            Focusing
          </div>
        )}
      </div>
    </motion.div>
  );
}

