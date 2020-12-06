import {Expression, seqs, alts, opt} from "../combi";
import {TargetField, Source, TargetFieldSymbol} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const index = seqs("INDEX INTO", TargetField);
    return seqs(alts(TargetFieldSymbol, TargetField), "IN", Source, opt(index));
  }
}