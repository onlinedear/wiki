import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useMemo } from "react";
import React from "react";
import { getFileUrl } from "@/lib/config.ts";
import clsx from "clsx";

function VideoView(props: NodeViewProps) {
  const { node, selected } = props;
  const { src, width, align } = node.attrs;

  const alignClass = useMemo(() => {
    if (align === "left") return "alignLeft";
    if (align === "right") return "alignRight";
    if (align === "center") return "alignCenter";
    return "alignCenter";
  }, [align]);

  return (
    <NodeViewWrapper>
      <video
        preload="metadata"
        width={width}
        controls
        src={getFileUrl(src)}
        className={clsx(selected ? "ProseMirror-selectednode" : "", alignClass)}
        style={{ display: "block" }}
      />
    </NodeViewWrapper>
  );
}

export default React.memo(VideoView);
