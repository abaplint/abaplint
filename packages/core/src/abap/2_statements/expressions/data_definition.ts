import {seq, alt, opt, per, Expression} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const simple = opt(per("READ-ONLY",
                           Expressions.Type,
                           Expressions.Length,
                           Expressions.Decimals,
                           Expressions.Value));

    const table = seq(Expressions.TypeTable, opt("READ-ONLY"));

    return seq(Expressions.DefinitionName,
               opt(Expressions.ConstantFieldLength),
               alt(simple, table));

  }
}