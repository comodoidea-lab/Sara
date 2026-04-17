import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface ArcanaCardProps {
  task: Task;
  onComplete: () => void;
  onCycle?: () => void;
  index: number;
  total: number;
}

/** 手札のように扇状。index 0 が正面、以降は左右に薄くチラ見せ */
function getFanPlacement(index: number, total: number) {
  if (total <= 1) {
    return {x: 0, y: 0, rotate: 0, scale: 1, opacity: 1};
  }
  if (index === 0) {
    return {x: 0, y: 0, rotate: 0, scale: 1, opacity: 1};
  }
  const isLeft = index % 2 === 1;
  const sign = isLeft ? -1 : 1;
  const depth = index;
  const rotate = sign * (10 + (depth - 1) * 4);
  const x = sign * (24 + depth * 18);
  const y = 12 + (depth - 1) * 8;
  const scale = Math.max(0.86, 1 - index * 0.04);
  const opacity = Math.min(0.4, 0.18 + 0.07 * (total - index));
  return {x, y, rotate, scale, opacity};
}

export const ArcanaCard: React.FC<ArcanaCardProps> = ({
  task,
  onComplete,
  onCycle,
  index,
  total,
}) => {
  const isCompleted = task.status === 'completed';
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];
  const numeral = romanNumerals[index] || (index + 1).toString();

  const fan = useMemo(() => getFanPlacement(index, total), [index, total]);

  const handleDragEnd = (_: unknown, info: {offset: {x: number; y: number}}) => {
    if (index !== 0 || isCompleted) return;
    const {x, y} = info.offset;
    const ax = Math.abs(x);
    const ay = Math.abs(y);
    // 縦優先で上スワイプ完了
    if (y < -80 && ay >= ax) {
      onComplete();
      return;
    }
    // 横優先でめくり（順番ローテ）
    if (ax > 55 && ax >= ay) {
      onCycle?.();
    }
  };

  return (
    <motion.div
      style={{transformOrigin: '50% 92%'}}
      drag={index === 0 && !isCompleted ? true : false}
      dragConstraints={{top: -100, bottom: 0, left: -140, right: 140}}
      dragElastic={0.18}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      initial={{scale: fan.scale * 0.85, opacity: 0, rotate: fan.rotate}}
      animate={{
        x: fan.x,
        y: fan.y,
        rotate: fan.rotate,
        scale: fan.scale,
        opacity: fan.opacity,
        zIndex: total - index,
      }}
      exit={{
        scale: fan.scale * 1.15,
        opacity: 0,
        y: fan.y - 80,
        filter: 'brightness(2) blur(10px)',
      }}
      transition={{duration: 0.55, ease: [0.23, 1, 0.32, 1]}}
      className={cn(
        'absolute w-full max-w-[280px] h-[400px] rounded-xl border flex flex-col p-6 items-center justify-center text-center overflow-hidden arcana-card-glass',
        index === 0
          ? 'border-primary/45 shadow-[0_0_40px_rgba(212,175,55,0.2)]'
          : 'border-primary/18 pointer-events-none',
        index > 0 && 'shadow-[0_6px_24px_rgba(0,0,0,0.45)]',
      )}
    >
      <div className="absolute inset-2 card-inner-border rounded-lg pointer-events-none opacity-60" />

      <div className="font-serif text-sm text-primary mb-10 z-10">
        {numeral}
      </div>

      <div className="flex-grow flex flex-col items-center justify-center z-10 min-h-0">
        <h3
          className={cn(
            'font-serif font-light text-white leading-relaxed mb-4 line-clamp-4',
            index === 0 ? 'text-2xl' : 'text-lg opacity-70',
          )}
        >
          {task.content}
        </h3>
        {!isCompleted && index === 0 && (
          <p className="text-[11px] opacity-40 font-sans tracking-widest uppercase">
            今のあなたの、一番の手札。
          </p>
        )}
      </div>

      <div className="mt-auto z-10 w-full flex flex-col items-center shrink-0">
        {index === 0 && !isCompleted && (
          <motion.button
            whileHover={{scale: 1.05, background: '#d4af37', color: '#05070a'}}
            whileTap={{scale: 0.95}}
            onClick={onComplete}
            className="border border-primary text-primary font-serif text-xs uppercase tracking-widest px-8 py-2.5 rounded-full transition-all"
          >
            完了として捧げる
          </motion.button>
        )}

        {isCompleted && (
          <motion.div
            initial={{scale: 0.5, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <CheckCircle2 size={32} strokeWidth={1} />
            <span className="font-serif italic text-xs">Ritual Completed</span>
          </motion.div>
        )}

        {index === 0 && !isCompleted && (
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="font-serif text-[10px] text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-1 rounded">
              Focusing
            </div>
            <p className="text-[9px] opacity-35 font-sans tracking-widest text-center max-w-[220px]">
              上にスワイプで完了 · 横にスワイプで手札をめくる
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
