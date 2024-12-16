import {CDSArithmetics, CDSCast, CDSCondition, CDSFunction, CDSName, CDSString} from ".";
import {alt, altPrio, Expression, opt, optPrio, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, optPrio(seq(".", CDSName)));
    const value = alt(name, CDSString, CDSFunction, CDSCase, CDSCast, CDSArithmetics);
    const simple = seq("CASE", alt(name, CDSFunction), plusPrio(seq("WHEN", value, "THEN", value)), "ELSE", value, "END");
    const complex = seq("CASE", plusPrio(seq("WHEN", CDSCondition, "THEN", value)), opt(seq("ELSE", value)), "END");
    return altPrio(simple, complex);
  }
}