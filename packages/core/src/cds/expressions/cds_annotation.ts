import {CDSName, CDSString} from ".";
import {alt, Expression, opt, regex, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotation extends Expression {
  public getRunnable(): IStatementRunnable {
// todo: add all the known annotations

    const value = alt(CDSString,
                      "true",
                      "false",
                      regex(/^\d+$/),
                      seq(regex(/^\d+$/), ".", regex(/^\d+$/)),
                      regex(/^#[\w_]+$/));

    const namedot = seq(CDSName, star(seq(".", CDSName)));
    const valueNested = seq("{", namedot, ":", value, star(seq(",", namedot, ":", value)), "}");
    const valueList = seq("[", alt(value, valueNested), star(seq(",", alt(value, valueNested))), "]");

    return seq(regex(/^@\w+$/), star(seq(".", regex(/^\w+$/))), opt(":"),
               opt(alt(valueList, valueNested, value)));
  }
}