import {alt, Expression, seq, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCardinality extends Expression {
  public getRunnable(): IStatementRunnable {
    const numeric = seq("[", alt("0", "1", "*"), opt(seq(".", ".", alt("0", "1", "*"))), "]");
    const num = alt("ONE", "MANY");
    const text = seq(num, "TO", num);
    return alt(numeric, text);
  }
}