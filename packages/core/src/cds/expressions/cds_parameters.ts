import {CDSName, CDSString} from ".";
import {alt, Expression, opt, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const value = alt(name, CDSString);
    return seq("[", regex(/\d+/), ":", name, "=", value, "]");
  }
}