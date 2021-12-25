import {CDSName, CDSString} from ".";
import {alt, Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSWhere extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(CDSName, star(seq(".", CDSName)));
    const condition = seq(field, "=", alt(CDSString, field));
    return seq("WHERE", condition, star(seq("AND", condition)));
  }
}