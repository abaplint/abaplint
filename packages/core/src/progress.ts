export interface IProgress {
  set(total: number, text: string): void;
  tick(text: string): Promise<void>;
  // todo, tickSync will be removed sometime
  tickSync(text: string): void;
}