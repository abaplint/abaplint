import {CDSAggregate, CDSArithmetics, CDSCase, CDSFunction, CDSName, CDSString, CDSType} from ".";
import {altPrio, Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCast extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, optPrio(seq(".", CDSName)));
    return seq("CAST", "(", altPrio(CDSFunction, CDSCase, CDSAggregate, CDSCast, CDSString, CDSArithmetics, name), "AS", CDSType, optPrio(seq("PRESERVING", "TYPE")), ")");
  }
}