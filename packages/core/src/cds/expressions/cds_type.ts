import {CDSName} from ".";
import {Expression, optPrio, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSType extends Expression {
  public getRunnable(): IStatementRunnable {
    const decimals = seq(",", regex(/\d+/));
    return seq(CDSName, optPrio(seq(".", CDSName)), optPrio(seq("(", regex(/\d+/), optPrio(decimals), ")")));
  }
}