export interface FontPreset {
  label: string
  import: string
  bodyCSS: string
  headingCSS: string
  previewFamily: string
}

export const FONT_PRESETS: Record<string, FontPreset> = {
  default: {
    label: 'Geist (Predvolený)',
    import: '',
    bodyCSS: '',
    headingCSS: '',
    previewFamily: 'system-ui, sans-serif',
  },
  inter: {
    label: 'Inter',
    import: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');",
    bodyCSS: 'body { font-family: "Inter", sans-serif; }',
    headingCSS: '',
    previewFamily: '"Inter", sans-serif',
  },
  montserrat: {
    label: 'Montserrat',
    import: "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');",
    bodyCSS: 'body { font-family: "Montserrat", sans-serif; }',
    headingCSS: '',
    previewFamily: '"Montserrat", sans-serif',
  },
  poppins: {
    label: 'Poppins',
    import: "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');",
    bodyCSS: 'body { font-family: "Poppins", sans-serif; }',
    headingCSS: '',
    previewFamily: '"Poppins", sans-serif',
  },
  raleway: {
    label: 'Raleway',
    import: "@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap');",
    bodyCSS: 'body { font-family: "Raleway", sans-serif; }',
    headingCSS: '',
    previewFamily: '"Raleway", sans-serif',
  },
  playfair: {
    label: 'Playfair Display',
    import: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');",
    bodyCSS: '',
    headingCSS: 'h1, h2, h3, h4, h5, h6 { font-family: "Playfair Display", serif; }',
    previewFamily: '"Playfair Display", serif',
  },
}
