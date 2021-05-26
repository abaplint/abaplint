import {seq, tok, Expression, altPrio, starPrio} from "../combi";
import {SQLFieldName} from ".";
import {WDashW, WPlusW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLArithmetics extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio(tok(WPlusW), tok(WDashW), "*", "/");
    return seq(SQLFieldName, starPrio(seq(operator, SQLFieldName)));
  }
}