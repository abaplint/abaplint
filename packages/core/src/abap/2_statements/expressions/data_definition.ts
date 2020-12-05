import {str, seqs, alt, opt, per, Expression} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {

    const occurs = seqs("OCCURS", Expressions.Integer);
    const initial = seqs("INITIAL SIZE", Expressions.Integer);

    const simple = opt(per(str("READ-ONLY"),
                           occurs,
                           initial,
                           str("WITH HEADER LINE"),
                           new Expressions.Type(),
                           new Expressions.Length(),
                           new Expressions.Decimals(),
                           new Expressions.Value()));

    const table = seqs(Expressions.TypeTable,
                       opt(str("READ-ONLY")),
                       opt(initial));

    return seqs(Expressions.DefinitionName,
                opt(new Expressions.ConstantFieldLength()),
                alt(simple, table));

  }
}