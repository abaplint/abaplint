import {Expression, optPrio, regex, seq, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSName extends Expression {
  public getRunnable(): IStatementRunnable {
    const pre = seq("/", regex(/^[\w_]+$/), "/");
    return altPrio(
      regex(/^"(?:[^"]|"")*"$/),
      seq(optPrio(":"), optPrio(pre), regex(/^\$?#?[\w_]+$/)),
    );
  }
}