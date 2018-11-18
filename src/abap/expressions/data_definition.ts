import {str, seq, alt, opt, per, IRunnable, Expression} from "../combi";
import * as Expressions from "../expressions";

export class DataDefinition extends Expression {
  public getRunnable(): IRunnable {

    const simple = opt(per(str("READ-ONLY"),
                           new Expressions.Type(),
                           new Expressions.Length(),
                           new Expressions.Decimals(),
                           new Expressions.Value()));

    const initial = seq(str("INITIAL SIZE"), new Expressions.Integer());

    const table = seq(new Expressions.TypeTable(),
                      opt(str("READ-ONLY")),
                      opt(initial));

    return seq(new Expressions.NamespaceSimpleName(),
               opt(new Expressions.FieldLength()),
               alt(simple, table));

  }
}