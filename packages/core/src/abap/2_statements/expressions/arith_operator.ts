import {tok, Expression, altPrio} from "../combi";
import {WPlusW, WDashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class ArithOperator extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = altPrio(tok(WPlusW),
                        tok(WDashW),
                        "*",
                        "**",
                        "/",
                        "BIT-XOR",
                        "BIT-AND",
                        "BIT-OR",
                        "DIV",
                        "MOD");

    return ret;
  }
}