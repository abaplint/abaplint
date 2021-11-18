import {seq, tok, alt, Expression, altPrio, starPrio} from "../combi";
import {SQLFieldName, SQLFunction} from ".";
import {WDashW, WPlusW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLArithmetics extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio(tok(WPlusW), tok(WDashW), "*", "/");
    const field = alt(SQLFieldName, SQLFunction);
    return seq(field, starPrio(seq(operator, field)));
  }
}