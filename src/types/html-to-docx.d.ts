declare module 'html-to-docx' {
  interface Margins {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }

  interface Options {
    orientation?: 'portrait' | 'landscape'
    margins?: Margins
    font?: string
    /** V polovičných bodoch — 22 znamená 11 pt. */
    fontSize?: number
    table?: { row?: { cantSplit?: boolean } }
    title?: string
    creator?: string
  }

  /** Vráti .docx ako Buffer. Druhý parameter je hlavička dokumentu (nepoužívame). */
  export default function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString: string | null,
    options?: Options,
  ): Promise<Buffer>
}
