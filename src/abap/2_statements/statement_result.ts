import {ILexerResult} from "../1_lexer/lexer_result";
import {StatementNode} from "../nodes";

export interface IStatementResult extends ILexerResult {
  readonly statements: readonly StatementNode[];
}