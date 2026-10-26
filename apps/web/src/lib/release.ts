export const formatReleaseDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined

export const formatFileSize = (bytes?: number) => (bytes ? `${Math.round(bytes / 1048576)} MB` : undefined)
