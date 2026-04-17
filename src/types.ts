/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'pending' | 'completed' | 'expired';

export interface Task {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number;
  status: TaskStatus;
}

export interface AppState {
  todayTasks: Task[];
  stockTasks: Task[];
  lastResetDate: string; // ISO string for the day
  /** 候補バーに出すストック1件（ランダム選出の結果を保持） */
  stockCandidateId: string | null;
}

export const STORAGE_KEY = 'sara_app_state';
export const STOCK_EXPIRY_DAYS = 3;
export const MAX_TODAY_TASKS = 3;
