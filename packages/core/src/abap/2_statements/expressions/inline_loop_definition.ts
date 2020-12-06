import {Expression, seq, alt, opts} from "../combi";
import {TargetField, Source, TargetFieldSymbol} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const index = seq("INDEX INTO", TargetField);
    return seq(alt(TargetFieldSymbol, TargetField), "IN", Source, opts(index));
  }
}