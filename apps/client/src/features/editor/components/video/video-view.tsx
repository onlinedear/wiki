import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useMemo } from "react";
import React from "react";
import { getFileUrl } from "@/lib/config.ts";
import clsx from "clsx";
import styles from "./video-view.module.css";

function VideoView(props: NodeViewProps) {
  const { node, selected } = props;
  const { src, width, align } = node.attrs;

  const alignClass = useMemo(() => {
    if (align === "left") return styles.alignLeft;
    if (align === "right") return styles.alignRight;
    if (align === "center") return styles.alignCenter;
    return styles.alignCenter;
  }, [align]);

  return (
    <NodeViewWrapper>
      <div className={clsx(styles.videoWrapper, alignClass)}>
        <video
          preload="metadata"
          width={width}
          controls
          src={getFileUrl(src)}
          className={clsx(selected ? "ProseMirror-selectednode" : "")}
        />
      </div>
    </NodeViewWrapper>
  );
}

export default React.memo(VideoView);
