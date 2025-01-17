import {CDSArithmetics, CDSCast, CDSCondition, CDSFunction, CDSName, CDSString} from ".";
import {altPrio, Expression, optPrio, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, optPrio(seq(".", CDSName)));
    const value = altPrio(CDSFunction, CDSString, CDSCase, CDSCast, CDSArithmetics, name);
    const simple = seq(altPrio(CDSFunction, name), plusPrio(seq("WHEN", value, "THEN", value)), "ELSE", value, "END");
    const complex = seq(plusPrio(seq("WHEN", CDSCondition, "THEN", value)), optPrio(seq("ELSE", value)), "END");
    return seq("CASE", altPrio(complex, simple));
  }
}