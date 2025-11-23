import { useAtomValue } from 'jotai';
import { currentUserAtom } from '@/features/user/atoms/current-user-atom';

export function useAppName(): string {
  const currentUser = useAtomValue(currentUserAtom);
  return currentUser?.workspace?.name || 'NoteDoc';
}
