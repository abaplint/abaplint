import {seq, alt, opt, per, Expression} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {

//    const occurs = seq("OCCURS", Expressions.Integer);
    const initial = seq("INITIAL SIZE", Expressions.Integer);

    const simple = opt(per("READ-ONLY",
    /*
                           occurs,
                           initial,
                           "WITH HEADER LINE",
                           */
                           Expressions.Type,
                           Expressions.Length,
                           Expressions.Decimals,
                           Expressions.Value));

    const table = seq(Expressions.TypeTable,
                      opt("READ-ONLY"),
                      opt(initial));

    return seq(Expressions.DefinitionName,
               opt(Expressions.ConstantFieldLength),
               alt(simple, table));

  }
}