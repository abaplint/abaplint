import {CDSCase, CDSCast, CDSFunction, CDSName, CDSString} from ".";
import {alt, altPrio, Expression, opt, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSArithmetics extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const val = alt(regex(/^\d+$/), name, CDSFunction, CDSCase, CDSCast, CDSString);
    const operator = altPrio("+", "-", "*", "/");
    return seq(val, operator, val);
  }
}