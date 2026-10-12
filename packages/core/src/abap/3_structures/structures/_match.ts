import {StatementNode} from "../../nodes/statement_node";

export interface IMatch {
  matched: StatementNode[];
  unmatched: StatementNode[];
  error: boolean;
  errorDescription: string;
  errorMatched: number;
}
/** A match from an index: statements[index] up to statements[next] were matched */
export interface IMatchAt {
  next: number;
  error: boolean;
  errorDescription: string;
  errorMatched: number;
}
