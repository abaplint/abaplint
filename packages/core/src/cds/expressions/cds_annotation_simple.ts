import {CDSString} from ".";
import {alt, Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotationSimple extends Expression {
  public getRunnable(): IStatementRunnable {

    const value = alt(CDSString,
                      "true",
                      "false",
                      regex(/^\d+$/),
                      seq(regex(/^\d+$/), ".", regex(/^\d+$/)),
                      regex(/^#[\w_]+$/));

    return value;
  }
}