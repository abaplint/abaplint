import {str, seq, alt, opt, per, Expression} from "../combi";
import * as Expressions from ".";
import {Integer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {

    const occurs = seq(str("OCCURS"), new Integer());
    const initial = seq(str("INITIAL SIZE"), new Expressions.Integer());

    const simple = opt(per(str("READ-ONLY"),
                           occurs,
                           initial,
                           str("WITH HEADER LINE"),
                           new Expressions.Type(),
                           new Expressions.Length(),
                           new Expressions.Decimals(),
                           new Expressions.Value()));

    const table = seq(new Expressions.TypeTable(),
                      opt(str("READ-ONLY")),
                      opt(initial));

    return seq(new Expressions.NamespaceSimpleName(),
               opt(new Expressions.ConstantFieldLength()),
               alt(simple, table));

  }
}