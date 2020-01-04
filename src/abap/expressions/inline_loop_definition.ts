import {Expression, IStatementRunnable, seq, str, alt} from "../combi";
import {TargetField, Source, TargetFieldSymbol} from ".";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(alt(new TargetFieldSymbol(), new TargetField()), str("IN"), new Source());
  }
}