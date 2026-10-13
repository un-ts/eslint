/// <reference types="vite/client" />
/// <reference types="web" />

declare module '*.md' {
  import type { ComponentType } from 'react'

  const Component: ComponentType
  export default Component
}

declare module 'github-markdown-css' {}
