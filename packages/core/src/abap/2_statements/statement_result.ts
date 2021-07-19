import {IABAPLexerResult} from "../1_lexer/lexer_result";
import {StatementNode} from "../nodes";

export interface IStatementResult extends IABAPLexerResult {
  readonly statements: readonly StatementNode[];
}