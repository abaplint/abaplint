import {Expression, IStatementRunnable, seq, str} from "../combi";
import {Field, Source} from ".";

export class InlineFieldDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new Field(), str("="), new Source());
  }
}