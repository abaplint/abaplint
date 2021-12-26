import {alt, Expression, seq, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCardinality extends Expression {
  public getRunnable(): IStatementRunnable {
    const cardinality = seq("[", alt("0", "1"), opt(seq(".", ".", alt("0", "1", "*"))), "]");
    return cardinality;
  }
}