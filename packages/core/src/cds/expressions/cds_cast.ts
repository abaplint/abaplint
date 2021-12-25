import {CDSFunction, CDSName} from ".";
import {alt, Expression, opt, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCast extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    return seq("CAST", "(", alt(name, CDSFunction), "AS", CDSName, opt(seq("PRESERVING", "TYPE")), ")");
  }
}