import {StatementNode} from "../../nodes/statement_node";

export interface IMatch {
  matched: StatementNode[];
  unmatched: StatementNode[];
  error: boolean;
  errorDescription: string;
  errorMatched: number;
}