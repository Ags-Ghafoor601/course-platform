"use client"

import MDEditor from "@uiw/react-markdown-preview"

export default function LessonContent({ content }: { content: string }) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <MDEditor
        source={content}
        style={{
          backgroundColor: "transparent",
          color: "inherit",
          fontFamily: "inherit",
        }}
      />
    </div>
  )
}