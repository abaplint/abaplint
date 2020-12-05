import {seqs, regex as reg, Expression, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class ConcatenatedConstant extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo: replace optPrio with plusPrio when its implemented, below is a workaround
    return seqs(reg(/^`.*`$/), "&", reg(/^`.*`$/),
                optPrio(seqs("&", reg(/^`.*`$/))),
                optPrio(seqs("&", reg(/^`.*`$/))),
                optPrio(seqs("&", reg(/^`.*`$/))));
  }
}