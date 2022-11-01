import {CDSAs} from ".";
import {Expression, opt, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const pre = seq("/", regex(/^[\w_]+$/), "/");
    return seq(opt(pre), regex(/^[\w_]+$/), opt(CDSAs));
  }
}