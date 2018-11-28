import {str, seq, alt, opt, per, IStatementRunnable, Expression} from "../combi";
import * as Expressions from "../expressions";
import {Integer} from "../expressions";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {

    const occurs = seq(str("OCCURS"), new Integer());
    const initial = seq(str("INITIAL SIZE"), new Expressions.Integer());

    const simple = opt(per(str("READ-ONLY"),
                           occurs,
                           initial,
                           str("WITH HEADER LINE"),
                           new Expressions.Type(),
//                           new Expressions.TypeTable(),
                           new Expressions.Length(),
                           new Expressions.Decimals(),
                           new Expressions.Value()));

    const table = seq(new Expressions.TypeTable(),
                      opt(str("READ-ONLY")),
                      opt(initial));

    return seq(new Expressions.NamespaceSimpleName(),
               opt(new Expressions.FieldLength()),
               alt(simple, table));

  }
}