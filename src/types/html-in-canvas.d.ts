export {}

declare global {
  interface CanvasRenderingContext2D {
    drawElementImage?(
      element: Element,
      dx: number,
      dy: number,
      dWidth?: number,
      dHeight?: number,
    ): void
    drawElement?(
      element: Element,
      dx: number,
      dy: number,
      dWidth?: number,
      dHeight?: number,
    ): void
  }

  interface HTMLCanvasElement {
    requestPaint?(): void
    layoutsubtree?: boolean
  }
}
