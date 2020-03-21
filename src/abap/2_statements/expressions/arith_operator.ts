import {str, tok, Expression, altPrio} from "../combi";
import {WPlusW, WDashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class ArithOperator extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = altPrio(tok(WPlusW),
                        tok(WDashW),
                        str("*"),
                        str("**"),
                        str("/"),
                        str("BIT-XOR"),
                        str("BIT-AND"),
                        str("BIT-OR"),
                        str("DIV"),
                        str("MOD"));

    return ret;
  }
}