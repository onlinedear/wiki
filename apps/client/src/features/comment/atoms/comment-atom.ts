import { atom } from 'jotai';

export const showCommentPopupAtom = atom<boolean>(false);
export const activeCommentIdAtom = atom<string>('');
export const draftCommentIdAtom = atom<string>('');

// 用于存储引用的任务信息
export interface TaskReference {
  taskId: string;
  taskName: string;
}

// Make it writable explicitly
export const taskReferenceAtom = atom<TaskReference | null, [TaskReference | null], void>(
  null,
  (_get, set, newValue) => {
    set(taskReferenceAtom, newValue);
  }
);
