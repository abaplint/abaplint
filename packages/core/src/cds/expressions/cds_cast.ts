import {CDSCase, CDSFunction, CDSName, CDSString, CDSType} from ".";
import {alt, Expression, opt, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCast extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    return seq("CAST", "(", alt(name, CDSFunction, CDSCase, CDSString), "AS", CDSType, opt(seq("PRESERVING", "TYPE")), ")");
  }
}