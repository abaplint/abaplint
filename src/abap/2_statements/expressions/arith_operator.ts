import {str, tok, Expression, IStatementRunnable, altPrio} from "../combi";
import {WPlusW, WDashW} from "../../1_lexer/tokens";

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