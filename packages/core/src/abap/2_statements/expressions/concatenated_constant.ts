import {seq, regex as reg, Expression, plusPrio, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class ConcatenatedConstant extends Expression {
  public getRunnable(): IStatementRunnable {
    const str = seq(reg(/^`.*`$/), plusPrio(seq("&", reg(/^`.*`$/))));
    const char = seq(reg(/^'.*'$/), plusPrio(seq("&", reg(/^'.*'$/))));
    return altPrio(str, char);
  }
}