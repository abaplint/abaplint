import {Expression, seqs, opts, pluss} from "../combi";
import {Let, For, Field, Source, InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReduceBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seqs(Field, "=", Source);

    const init = seqs("INIT", pluss(InlineFieldDefinition));

    return seqs(opts(Let),
                init,
                For,
                "NEXT",
                pluss(fields));
  }
}