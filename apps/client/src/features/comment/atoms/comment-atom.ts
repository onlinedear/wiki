import { atom } from 'jotai';

export const showCommentPopupAtom = atom<boolean>(false);
export const activeCommentIdAtom = atom<string>('');
export const draftCommentIdAtom = atom<string>('');

// 用于存储引用的任务信息
export interface TaskReference {
  taskId: string;
  taskName: string;
}

export const taskReferenceAtom = atom<TaskReference | null>(null);
