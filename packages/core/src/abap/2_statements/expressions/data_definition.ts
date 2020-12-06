import {str, seqs, alts, opts, per, Expression} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {

    const occurs = seqs("OCCURS", Expressions.Integer);
    const initial = seqs("INITIAL SIZE", Expressions.Integer);

    const simple = opts(per(str("READ-ONLY"),
                            occurs,
                            initial,
                            str("WITH HEADER LINE"),
                            new Expressions.Type(),
                            new Expressions.Length(),
                            new Expressions.Decimals(),
                            new Expressions.Value()));

    const table = seqs(Expressions.TypeTable,
                       opts("READ-ONLY"),
                       opts(initial));

    return seqs(Expressions.DefinitionName,
                opts(Expressions.ConstantFieldLength),
                alts(simple, table));

  }
}