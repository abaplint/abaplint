import {tok, Expression, altPrio} from "../combi";
import {WDashW, WPlusW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class SQLArithmeticOperator extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio(tok(WPlusW), tok(WDashW), "*", "/");
    return operator;
  }
}