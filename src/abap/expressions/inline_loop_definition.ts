import {Expression, IStatementRunnable, seq, str, alt} from "../combi";
import {Field, Source, FieldSymbol} from ".";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(alt(new FieldSymbol(), new Field()), str("IN"), new Source());
  }
}