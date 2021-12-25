import {alt, Expression, opt, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotation extends Expression {
  public getRunnable(): IStatementRunnable {
// todo: add all the known annotations
    return seq(regex(/^@\w+(\.\w+)+:?$/),
               opt(alt(regex(/^'\w+'$/),
                       "true",
                       regex(/^#\w+$/))));
  }
}