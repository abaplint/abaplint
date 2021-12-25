import {alt, Expression, opt, regex, seq, star, plus} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotation extends Expression {
  public getRunnable(): IStatementRunnable {
// todo: add all the known annotations

    const value = alt(regex(/^'[\w ]+'$/),
                      "true",
                      "false",
                      regex(/^#\w+$/));

    const valueList = seq("[", value, star(seq(",", value)), "]");

    return seq(regex(/^@\w+$/), plus(seq(".", regex(/^\w+$/))), opt(":"),
               opt(alt(valueList, value)));
  }
}