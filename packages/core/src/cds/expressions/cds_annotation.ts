import {CDSName} from ".";
import {alt, Expression, opt, regex, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotation extends Expression {
  public getRunnable(): IStatementRunnable {
// todo: add all the known annotations

    const value = alt(regex(/^'[\w ]+'$/),
                      "true",
                      "false",
                      regex(/^\d+$/),
                      seq(regex(/^\d+$/), ".", regex(/^\d+$/)),
                      regex(/^#\w+$/));

    const valueList = seq("[", value, star(seq(",", value)), "]");

    const valueNested = seq("{", CDSName, star(seq(".", CDSName)), ":", value, "}");

    return seq(regex(/^@\w+$/), star(seq(".", regex(/^\w+$/))), opt(":"),
               opt(alt(valueList, valueNested, value)));
  }
}