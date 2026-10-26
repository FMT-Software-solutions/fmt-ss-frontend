import type { IAppRelease } from "@/types/premium-app"
import { formatReleaseDate } from "@/lib/release"

/**
 * The small Markdown subset the release scripts write: ### headings, "- "
 * bullets, **bold** and plain lines.
 */
function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="ml-5 list-disc space-y-1">
          {list.map((item, i) => <li key={i}>{inline(item)}</li>)}
        </ul>,
      )
      list = []
    }
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ""))
      continue
    }
    flush()
    if (!line) continue
    const heading = line.match(/^#{1,6}\s+(.*)$/)
    blocks.push(
      heading ? (
        <p key={blocks.length} className="pt-2 font-semibold">{heading[1]}</p>
      ) : (
        <p key={blocks.length}>{inline(line)}</p>
      ),
    )
  }
  flush()
  return <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{blocks}</div>
}

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong> : part,
  )
}

export function ReleaseNotes({ releases }: { releases: IAppRelease[] }) {
  return (
    <ol className="space-y-8">
      {releases.map((release, i) => (
        <li key={release.version} className="relative border-l pl-6">
          <span className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
          <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
            <h3 className="font-semibold">Version {release.version}</h3>
            <span className="text-sm text-muted-foreground">{formatReleaseDate(release.releaseDate)}</span>
            {i === 0 && <span className="text-xs font-medium text-primary">Latest</span>}
          </div>
          {release.notes ? <Markdown text={release.notes} /> : null}
        </li>
      ))}
    </ol>
  )
}
