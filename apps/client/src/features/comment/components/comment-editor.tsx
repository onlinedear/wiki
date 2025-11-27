import { EditorContent, useEditor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { StarterKit } from "@tiptap/starter-kit";
import classes from "./comment.module.css";
import { useFocusWithin } from "@mantine/hooks";
import clsx from "clsx";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import EmojiCommand from "@/features/editor/extensions/emoji-command";
import { useAtom } from "jotai";
import { taskReferenceAtom, type TaskReference } from "@/features/comment/atoms/comment-atom";
import { Badge, CloseButton, Group } from "@mantine/core";

interface CommentEditorProps {
  defaultContent?: any;
  onUpdate?: any;
  onSave?: any;
  editable: boolean;
  placeholder?: string;
  autofocus?: boolean;
  showTaskReference?: boolean; // 是否显示任务引用徽章
}

const CommentEditor = forwardRef(
  (
    {
      defaultContent,
      onUpdate,
      onSave,
      editable,
      placeholder,
      autofocus,
      showTaskReference = false,
    }: CommentEditorProps,
    ref,
  ) => {
    const { t } = useTranslation();
    const { ref: focusRef, focused } = useFocusWithin();
    const [taskReference, setTaskReference] = useAtom<TaskReference | null>(taskReferenceAtom);

    const commentEditor = useEditor({
      extensions: [
        StarterKit.configure({
          gapcursor: false,
          dropcursor: false,
        }),
        Placeholder.configure({
          placeholder: placeholder || t("Reply..."),
        }),
        Underline,
        Link,
        EmojiCommand,
      ],
      editorProps: {
        handleDOMEvents: {
          keydown: (_view, event) => {
            if (
              [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Enter",
              ].includes(event.key)
            ) {
              const emojiCommand = document.querySelector("#emoji-command");
              if (emojiCommand) {
                return true;
              }
            }

            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              if (onSave) onSave();

              return true;
            }
          },
        },
      },
      onUpdate({ editor }) {
        if (onUpdate) onUpdate(editor.getJSON());
      },
      content: defaultContent,
      editable,
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      autofocus: (autofocus && "end") || false,
    });

    useEffect(() => {
      if (commentEditor && defaultContent) {
        commentEditor.commands.setContent(defaultContent);
      }
    }, [defaultContent, commentEditor]);

    useEffect(() => {
      if (commentEditor) {
        commentEditor.setEditable(editable);
      }
    }, [editable, commentEditor]);

    useEffect(() => {
      setTimeout(() => {
        if (autofocus && commentEditor) {
          commentEditor.commands.focus("end");
        }
      }, 10);
    }, [commentEditor, autofocus]);

    useImperativeHandle(ref, () => ({
      clearContent: () => {
        if (commentEditor) {
          commentEditor.commands.clearContent();
          setTaskReference(null);
        }
      },
    }));

    return (
      <div ref={focusRef} className={classes.commentEditor}>
        {showTaskReference && taskReference && (
          <Group gap="xs" mb="xs" p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <Badge variant="light" color="blue" size="lg">
              引用任务: {taskReference.taskName}
            </Badge>
            <CloseButton 
              size="sm" 
              onClick={() => setTaskReference(null)}
              aria-label="移除引用"
            />
          </Group>
        )}
        <EditorContent
          editor={commentEditor}
          className={clsx(classes.ProseMirror, { [classes.focused]: focused })}
        />
      </div>
    );
  },
);

export default CommentEditor;
