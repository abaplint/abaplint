import {CDSArithmetics, CDSCase, CDSCast, CDSFunction, CDSPrefixedName, CDSString, CDSType} from ".";
import {altPrio, Expression, opt, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAggregate extends Expression {
  public getRunnable(): IStatementRunnable {
    // CDSPrefixedName handles dotted paths with path filters e.g. a._Assoc[filter].Field
    // CDSArithmetics handles expressions like sum(A + B), max(A * 100)
    // fieldAsType handles avg(field AS type) / sum(field AS type) — SAP inline type coercion
    const fieldAsType = seq(CDSPrefixedName, "AS", CDSType);
    const value = altPrio(CDSArithmetics, CDSCast, CDSCase, CDSFunction, fieldAsType, CDSPrefixedName, CDSString, "*");
    return seq(altPrio("MAX", "MIN", "SUM", "AVG", "COUNT"), "(", opt("DISTINCT"), value, ")");
  }
}