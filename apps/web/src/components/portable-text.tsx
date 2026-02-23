import { PortableText as ReactPortableText, type PortableTextComponents } from "@portabletext/react"

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    h1: ({ children }) => <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 mt-8">{children}</h1>,
    h2: ({ children }) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4 mt-8">{children}</h2>,
    h3: ({ children }) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3 mt-6">{children}</h3>,
    h4: ({ children }) => <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2 mt-4">{children}</h4>,
    blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground my-4">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
    number: ({ children }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-2">{children}</li>,
    number: ({ children }) => <li className="pl-2">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">{children}</code>,
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
      return (
        <a 
          href={value?.href} 
          target={target} 
          rel={target === '_blank' ? 'noindex nofollow' : undefined}
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          {children}
        </a>
      )
    },
  },
}

interface PortableTextProps {
  value: any
  className?: string
}

export function PortableText({ value, className }: PortableTextProps) {
  return (
    <div className={className}>
      <ReactPortableText value={value} components={components} />
    </div>
  )
}
