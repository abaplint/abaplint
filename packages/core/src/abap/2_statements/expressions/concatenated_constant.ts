import {seqs, regex as reg, Expression, optPrios} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class ConcatenatedConstant extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo: replace optPrio with plusPrio when its implemented, below is a workaround
    return seqs(reg(/^`.*`$/), "&", reg(/^`.*`$/),
                optPrios(seqs("&", reg(/^`.*`$/))),
                optPrios(seqs("&", reg(/^`.*`$/))),
                optPrios(seqs("&", reg(/^`.*`$/))));
  }
}