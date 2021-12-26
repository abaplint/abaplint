import {CDSCast, CDSFunction, CDSName, CDSString} from ".";
import {alt, Expression, opt, plus, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCase extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const value = alt(name, CDSString, CDSFunction, CDSCase, CDSCast);
    return seq("CASE", name, plus(seq("WHEN", value, "THEN", value)), "ELSE", value, "END");
  }
}