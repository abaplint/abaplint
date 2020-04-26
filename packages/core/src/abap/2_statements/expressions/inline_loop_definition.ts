import {Expression, seq, str, alt, opt} from "../combi";
import {TargetField, Source, TargetFieldSymbol} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const index = seq(str("INDEX INTO"), new TargetField());
    return seq(alt(new TargetFieldSymbol(), new TargetField()), str("IN"), new Source(), opt(index));
  }
}