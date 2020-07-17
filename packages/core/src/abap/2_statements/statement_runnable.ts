import {Result} from "./result";

export interface IStatementRunnable {
  run(r: Result[]): Result[];
  railroad(): string;
  toStr(): string;
  getUsing(): string[];
  listKeywords(): string[];
// return first keyword, blank if not applicable
  first(): string[];
}