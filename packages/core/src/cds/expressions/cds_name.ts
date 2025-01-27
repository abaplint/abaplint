import {Expression, optPrio, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSName extends Expression {
  public getRunnable(): IStatementRunnable {
    const pre = seq("/", regex(/^[\w_]+$/), "/");
    return seq(optPrio(":"), optPrio(pre), regex(/^\$?#?[\w_]+$/));
  }
}