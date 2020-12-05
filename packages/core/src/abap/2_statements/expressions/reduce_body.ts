import {Expression, seqs, opt, plus} from "../combi";
import {Let, For, Field, Source, InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReduceBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seqs(Field, "=", Source);

    const init = seqs("INIT", plus(new InlineFieldDefinition()));

    return seqs(opt(new Let()),
                init,
                For,
                "NEXT",
                plus(fields));
  }
}