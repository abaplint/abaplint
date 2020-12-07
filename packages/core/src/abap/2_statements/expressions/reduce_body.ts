import {Expression, seq, opt, plus} from "../combi";
import {Let, For, Field, Source, InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReduceBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(Field, "=", Source);

    const init = seq("INIT", plus(InlineFieldDefinition));

    return seq(opt(Let),
               init,
               For,
               "NEXT",
               plus(fields));
  }
}