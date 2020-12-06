import {Expression, seq, opt, pluss} from "../combi";
import {Let, For, Field, Source, InlineFieldDefinition} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReduceBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(Field, "=", Source);

    const init = seq("INIT", pluss(InlineFieldDefinition));

    return seq(opt(Let),
               init,
               For,
               "NEXT",
               pluss(fields));
  }
}