import {seq, alt, opt, per, Expression, optPrio} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const simple = opt(per("READ-ONLY",
                           Expressions.Type,
                           Expressions.Length,
                           Expressions.Decimals,
                           Expressions.Value));

    const table = seq(Expressions.TypeTable, optPrio("READ-ONLY"));

    return seq(Expressions.DefinitionName,
               optPrio(Expressions.ConstantFieldLength),
               alt(simple, table, Expressions.TypeStructure));

  }
}