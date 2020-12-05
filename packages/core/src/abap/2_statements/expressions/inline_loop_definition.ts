import {Expression, seqs, alt, opt} from "../combi";
import {TargetField, Source, TargetFieldSymbol} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const index = seqs("INDEX INTO", TargetField);
    return seqs(alt(new TargetFieldSymbol(), new TargetField()), "IN", Source, opt(index));
  }
}