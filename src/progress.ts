export interface IProgress {
  set(total: number, text: string): void;
  tick(text: string): Promise<void>;
}

export class NoProgress implements IProgress {
  public set(_total: number, _text: string): undefined {
    return undefined;
  }

  public async tick(_text: string) {
    return undefined;
  }
}