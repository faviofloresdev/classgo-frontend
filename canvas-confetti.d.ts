declare module "canvas-confetti" {
  type ConfettiOptions = Record<string, unknown>

  interface ConfettiFn {
    (options?: ConfettiOptions): Promise<null> | null
    create?: (...args: unknown[]) => ConfettiFn
  }

  const confetti: ConfettiFn
  export default confetti
}
