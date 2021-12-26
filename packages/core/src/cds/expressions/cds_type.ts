import {CDSName} from ".";
import {Expression, opt, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSType extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(CDSName, opt(seq(".", CDSName)), opt(seq("(", regex(/\d+/), ")")));
  }
}