import {CDSArithmetics, CDSCase, CDSCast, CDSFunction, CDSPrefixedName} from ".";
import {altPrio, Expression, opt, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAggregate extends Expression {
  public getRunnable(): IStatementRunnable {
    // CDSPrefixedName handles dotted paths with path filters e.g. a._Assoc[filter].Field
    // CDSArithmetics handles expressions like sum(A + B), max(A * 100)
    const value = altPrio(CDSArithmetics, CDSCast, CDSCase, CDSFunction, CDSPrefixedName, "*");
    return seq(altPrio("MAX", "MIN", "SUM", "AVG", "COUNT"), "(", opt("DISTINCT"), value, ")");
  }
}