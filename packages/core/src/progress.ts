export interface IProgress {
  set(total: number, text: string): void;
  tick(text: string): Promise<void>;
}