import {altPrio, seq, regex as reg, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLPathCardinality extends Expression {
  public getRunnable(): IStatementRunnable {
    const exact = seq(tok(WParenLeftW), reg(/^\d+$/), tok(WParenRightW));
    const many = seq(tok(WParenLeftW), "*", tok(WParenRightW));
    return altPrio(exact, many);
  }
}
