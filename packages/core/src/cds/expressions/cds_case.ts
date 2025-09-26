import {CDSArithmetics, CDSCast, CDSCondition, CDSFunction, CDSName, CDSString} from ".";
import {altPrio, Expression, optPrio, plusPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, starPrio(seq(".", CDSName)));
    const value = altPrio(CDSFunction, CDSString, CDSCase, CDSCast, CDSArithmetics, name);
    const thenValue = altPrio(seq("(", value, ")"), value);
    const simple = seq(altPrio(CDSFunction, name), plusPrio(seq("WHEN", value, "THEN", thenValue)));
    const complex = plusPrio(seq("WHEN", CDSCondition, "THEN", thenValue));
    return seq("CASE", altPrio(complex, simple), optPrio(seq("ELSE", value)), "END");
  }
}