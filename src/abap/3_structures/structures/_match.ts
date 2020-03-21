import {StatementNode} from "../../nodes";

export interface IMatch {
  matched: StatementNode[];
  unmatched: StatementNode[];
  error: boolean;
  errorDescription: string;
  errorMatched: number;
}