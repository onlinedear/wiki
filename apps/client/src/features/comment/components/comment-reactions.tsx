import { Group, ActionIcon, Tooltip, Text } from "@mantine/core";
import {
  IconThumbUp,
  IconHeart,
  IconMoodSmile,
  IconMoodSurprised,
  IconMoodSad,
  IconMoodAngry,
} from "@tabler/icons-react";
import {
  useAddReactionMutation,
  useRemoveReactionMutation,
  useCommentReactionsQuery,
} from "../queries/comment-query";
import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/features/user/atoms/current-user-atom";

interface CommentReactionsProps {
  commentId: string;
}

const reactionIcons = {
  like: IconThumbUp,
  love: IconHeart,
  laugh: IconMoodSmile,
  surprised: IconMoodSurprised,
  sad: IconMoodSad,
  angry: IconMoodAngry,
};

const reactionLabels = {
  like: "Like",
  love: "Love",
  laugh: "Laugh",
  surprised: "Surprised",
  sad: "Sad",
  angry: "Angry",
};

export function CommentReactions({ commentId }: CommentReactionsProps) {
  const currentUser = useAtomValue(currentUserAtom);
  const { data: reactions = [] } = useCommentReactionsQuery(commentId);
  const addReactionMutation = useAddReactionMutation();
  const removeReactionMutation = useRemoveReactionMutation();

  const reactionCounts = reactions.reduce(
    (acc, r) => {
      acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const userReactions = reactions
    .filter((r) => r.userId === currentUser?.user?.id)
    .map((r) => r.reactionType);

  const handleReaction = (reactionType: string) => {
    if (userReactions.includes(reactionType)) {
      removeReactionMutation.mutate({ commentId, reactionType });
    } else {
      addReactionMutation.mutate({ commentId, reactionType });
    }
  };

  return (
    <Group gap="xs">
      {Object.entries(reactionIcons).map(([type, Icon]) => {
        const count = reactionCounts[type] || 0;
        const isActive = userReactions.includes(type);

        return (
          <Tooltip key={type} label={reactionLabels[type]}>
            <ActionIcon
              variant={isActive ? "filled" : "subtle"}
              color={isActive ? "blue" : "gray"}
              size="sm"
              onClick={() => handleReaction(type)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Icon size={14} />
              {count > 0 && <Text size="xs" style={{ lineHeight: 1 }}>{count}</Text>}
            </ActionIcon>
          </Tooltip>
        );
      })}
    </Group>
  );
}
