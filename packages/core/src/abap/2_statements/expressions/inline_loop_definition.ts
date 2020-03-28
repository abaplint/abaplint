import {Expression, seq, str, alt} from "../combi";
import {TargetField, Source, TargetFieldSymbol} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(alt(new TargetFieldSymbol(), new TargetField()), str("IN"), new Source());
  }
}