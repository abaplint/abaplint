import {seq, alts, opts, pers, Expression} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {

    const occurs = seq("OCCURS", Expressions.Integer);
    const initial = seq("INITIAL SIZE", Expressions.Integer);

    const simple = opts(pers("READ-ONLY",
                             occurs,
                             initial,
                             "WITH HEADER LINE",
                             Expressions.Type,
                             Expressions.Length,
                             Expressions.Decimals,
                             Expressions.Value));

    const table = seq(Expressions.TypeTable,
                      opts("READ-ONLY"),
                      opts(initial));

    return seq(Expressions.DefinitionName,
               opts(Expressions.ConstantFieldLength),
               alts(simple, table));

  }
}