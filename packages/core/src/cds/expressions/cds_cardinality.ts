import {altPrio, Expression, seq, optPrio, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCardinality extends Expression {
  public getRunnable(): IStatementRunnable {
    // Numeric cardinality: any non-negative integer or * (e.g. [0..1], [1..2], [0..*])
    const num = altPrio(regex(/^\d+$/), "*");
    const numeric = seq("[", num, optPrio(seq(".", ".", num)), "]");
    const textNum = altPrio("ONE", "MANY");
    const text = seq(textNum, "TO", textNum);
    return altPrio(numeric, text);
  }
}