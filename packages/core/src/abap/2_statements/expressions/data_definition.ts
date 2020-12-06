import {seqs, alts, opts, pers, Expression} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {

    const occurs = seqs("OCCURS", Expressions.Integer);
    const initial = seqs("INITIAL SIZE", Expressions.Integer);

    const simple = opts(pers("READ-ONLY",
                             occurs,
                             initial,
                             "WITH HEADER LINE",
                             Expressions.Type,
                             Expressions.Length,
                             Expressions.Decimals,
                             Expressions.Value));

    const table = seqs(Expressions.TypeTable,
                       opts("READ-ONLY"),
                       opts(initial));

    return seqs(Expressions.DefinitionName,
                opts(Expressions.ConstantFieldLength),
                alts(simple, table));

  }
}