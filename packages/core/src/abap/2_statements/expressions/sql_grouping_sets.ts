import {seq, starPrio, optPrio, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLField} from "./sql_field";

export class SQLGroupingSets extends Expression {
  public getRunnable(): IStatementRunnable {
    const set = seq(tok(WParenLeftW),
                    optPrio(seq(SQLField, starPrio(seq(",", SQLField)))),
                    tok(WParenRightW));
    const sets = seq(set, starPrio(seq(",", set)));
    return seq("GROUPING SETS", tok(WParenLeftW), sets, tok(WParenRightW));
  }
}
