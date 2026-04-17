import { useState, useEffect } from 'react';
import {
  AppState,
  Task,
  STORAGE_KEY,
  STOCK_EXPIRY_DAYS,
  MAX_TODAY_TASKS,
} from '../types';

function pickRandomStockCandidateId(
  tasks: Task[],
  excludeId?: string | null,
): string | null {
  if (tasks.length === 0) return null;
  const pool =
    excludeId != null ? tasks.filter(t => t.id !== excludeId) : tasks;
  const pickFrom = pool.length > 0 ? pool : tasks;
  return pickFrom[Math.floor(Math.random() * pickFrom.length)]!.id;
}

function normalizeLoadedState(parsed: Record<string, unknown>): AppState {
  const today = new Date().toISOString().split('T')[0];
  const stockTasks = (parsed.stockTasks as Task[]) ?? [];
  let stockCandidateId = (parsed.stockCandidateId as string | null | undefined) ?? null;
  if (stockTasks.length === 0) {
    stockCandidateId = null;
  } else if (
    !stockCandidateId ||
    !stockTasks.some(t => t.id === stockCandidateId)
  ) {
    stockCandidateId = pickRandomStockCandidateId(stockTasks);
  }
  return {
    todayTasks: (parsed.todayTasks as Task[]) ?? [],
    stockTasks,
    lastResetDate: (parsed.lastResetDate as string) ?? today,
    stockCandidateId,
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        return normalizeLoadedState(parsed);
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return {
      todayTasks: [],
      stockTasks: [],
      lastResetDate: new Date().toISOString().split('T')[0],
      stockCandidateId: null,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 日付変更で今日をリセット + ストック期限切れ除去 + 候補IDの整合
  useEffect(() => {
    const now = Date.now();
    const threeDaysMs = STOCK_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().split('T')[0];

    setState(prev => {
      const isNewDay = prev.lastResetDate !== today;
      let next: AppState = {...prev};
      if (isNewDay) {
        next = {...next, todayTasks: [], lastResetDate: today};
      }
      const validStocks = next.stockTasks.filter(
        t => now - t.createdAt < threeDaysMs,
      );
      next = {...next, stockTasks: validStocks};
      if (validStocks.length === 0) {
        next.stockCandidateId = null;
      } else if (
        !next.stockCandidateId ||
        !validStocks.some(t => t.id === next.stockCandidateId)
      ) {
        next.stockCandidateId = pickRandomStockCandidateId(validStocks);
      }
      return next;
    });
  }, []);

  const addToStock = (content: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      createdAt: Date.now(),
      expiresAt: Date.now() + STOCK_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      status: 'pending',
    };
    setState(prev => {
      const stockTasks = [newTask, ...prev.stockTasks];
      const keepCandidate =
        prev.stockCandidateId &&
        stockTasks.some(t => t.id === prev.stockCandidateId);
      const stockCandidateId = keepCandidate
        ? prev.stockCandidateId
        : pickRandomStockCandidateId(stockTasks);
      return {...prev, stockTasks, stockCandidateId};
    });
  };

  const moveRandomToToday = () => {
    setState(prev => {
      const pendingToday = prev.todayTasks.filter(
        t => t.status === 'pending',
      ).length;
      if (
        pendingToday >= MAX_TODAY_TASKS ||
        prev.stockTasks.length === 0
      ) {
        return prev;
      }

      const id = prev.stockCandidateId;
      const selected = id
        ? prev.stockTasks.find(t => t.id === id)
        : prev.stockTasks[0];
      if (!selected) return prev;

      const newStock = prev.stockTasks.filter(t => t.id !== selected.id);
      const stockCandidateId =
        newStock.length === 0
          ? null
          : pickRandomStockCandidateId(newStock);

      return {
        ...prev,
        todayTasks: [...prev.todayTasks, selected],
        stockTasks: newStock,
        stockCandidateId,
      };
    });
  };

  const completeTask = (id: string) => {
    setState(prev => ({
      ...prev,
      todayTasks: prev.todayTasks.map(t => t.id === id ? { ...t, status: 'completed' } : t),
    }));
  };

  /** 別のランダム候補へ（ストック順序は変えない） */
  const skipTask = () => {
    setState(prev => {
      if (prev.stockTasks.length === 0) return prev;
      const stockCandidateId = pickRandomStockCandidateId(
        prev.stockTasks,
        prev.stockCandidateId,
      );
      return {...prev, stockCandidateId};
    });
  };

  const cycleTodayTasks = () => {
    setState(prev => {
      if (prev.todayTasks.length <= 1) return prev;
      
      // We only want to cycle the active (pending) tasks
      const pendingIndices = prev.todayTasks
        .map((t, i) => t.status === 'pending' ? i : -1)
        .filter(i => i !== -1);
      
      if (pendingIndices.length <= 1) return prev;
      
      const newTasks = [...prev.todayTasks];
      const itemsToRotate = pendingIndices.map(i => prev.todayTasks[i]);
      
      // Rotate the items
      const rotated = [...itemsToRotate.slice(1), itemsToRotate[0]];
      
      pendingIndices.forEach((originalIdx, i) => {
        newTasks[originalIdx] = rotated[i];
      });
      
      return {
        ...prev,
        todayTasks: newTasks,
      };
    });
  };

  return {
    state,
    addToStock,
    moveRandomToToday,
    completeTask,
    skipTask,
    cycleTodayTasks,
  };
}
