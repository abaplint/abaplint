import {CDSAggregate, CDSArithmetics, CDSCase, CDSFunction, CDSInteger, CDSName, CDSString, CDSType} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCast extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, starPrio(seq(".", CDSName)));
    const first = altPrio(CDSFunction, CDSCase, CDSAggregate, CDSArithmetics, CDSCast, CDSString, CDSInteger, name);
    return seq("CAST", "(", first, "AS", CDSType, optPrio(seq("PRESERVING", "TYPE")), ")");
  }
}