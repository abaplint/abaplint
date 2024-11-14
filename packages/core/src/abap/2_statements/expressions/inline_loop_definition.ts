import {Expression, seq, opt, altPrio, optPrio} from "../combi";
import {TargetField, Source, TargetFieldSymbol, SimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class InlineLoopDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const index = seq("INDEX INTO", TargetField);
    const key = seq("USING KEY", SimpleName);
    return seq(altPrio(TargetFieldSymbol, TargetField), "IN", opt("GROUP"), Source, optPrio(key), optPrio(index));
  }
}