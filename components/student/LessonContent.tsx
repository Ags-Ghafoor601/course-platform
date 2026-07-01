"use client"

import MDPreview from "@uiw/react-markdown-preview"

export default function LessonContent({ content }: { content: string }) {
  return (
    <div
      data-color-mode="auto"
      className="rounded-lg border border-border overflow-hidden"
    >
      <MDPreview
        source={content}
        style={{
          backgroundColor: "transparent",
          padding: "1.5rem",
          fontFamily: "inherit",
        }}
        wrapperElement={{ "data-color-mode": "auto" } as any}
      />
    </div>
  )
}