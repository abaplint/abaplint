import {CDSName} from ".";
import {alt, Expression, regex, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSWhere extends Expression {
  public getRunnable(): IStatementRunnable {
    const constant = regex(/^'[\w ]+'$/);
    const field = seq(CDSName, star(seq(".", CDSName)));
    const condition = seq(field, "=", alt(constant, field));
    return seq("WHERE", condition, star(seq("AND", condition)));
  }
}