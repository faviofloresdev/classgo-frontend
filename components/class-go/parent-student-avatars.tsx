"use client"

import { buildParentLinkedAvatarUrls } from "@/lib/avatars"
import type { AvatarId } from "@/lib/types"

interface ParentStudentAvatarsProps {
  studentAvatarId: AvatarId
  parentAvatarId?: AvatarId
  studentName?: string
  parentLabel?: string
  className?: string
}

export function ParentStudentAvatars({
  studentAvatarId,
  parentAvatarId,
  studentName = "Student",
  parentLabel = "Parent",
  className = "",
}: ParentStudentAvatarsProps) {
  const { studentAvatarUrl, parentAvatarUrl } = buildParentLinkedAvatarUrls(
    studentAvatarId,
    parentAvatarId
  )

  return (
    <div className={`flex items-end -space-x-3 ${className}`.trim()}>
      <img
        src={parentAvatarUrl}
        alt={parentLabel}
        className="h-10 w-10 rounded-full border-2 border-white bg-white object-cover shadow-sm"
        crossOrigin="anonymous"
      />
      <img
        src={studentAvatarUrl}
        alt={studentName}
        className="h-12 w-12 rounded-full border-2 border-white bg-white object-cover shadow-md"
        crossOrigin="anonymous"
      />
    </div>
  )
}
