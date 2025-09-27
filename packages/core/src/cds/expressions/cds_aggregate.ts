import {CDSCase, CDSCast, CDSFunction, CDSName} from ".";
import {alt, altPrio, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAggregate extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, star(seq(".", CDSName)));
    const value = alt(name, "*", CDSCast, CDSCase, CDSFunction);
    return seq(altPrio("MAX", "MIN", "SUM", "AVG", "COUNT"), "(", opt("DISTINCT"), value, ")");
  }
}