import {seq, altPrio, tok, regex as reg, Expression} from "../combi";
import {WPlus} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCTEPathPrefix extends Expression {
  public getRunnable(): IStatementRunnable {
    const tildeIdent = reg(/^\w+~$/);
    return altPrio(seq(tok(WPlus), tildeIdent), tildeIdent);
  }
}
