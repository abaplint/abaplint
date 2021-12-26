import {CDSFunction, CDSName} from ".";
import {alt, Expression, opt, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCast extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const type = seq(CDSName, opt(seq(".", CDSName)), opt(seq("(", regex(/\d+/), ")")));
    return seq("CAST", "(", alt(name, CDSFunction), "AS", type, opt(seq("PRESERVING", "TYPE")), ")");
  }
}