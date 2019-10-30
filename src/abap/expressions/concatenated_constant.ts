import {seq, regex as reg, str, Expression, IStatementRunnable, optPrio} from "../combi";

export class ConcatenatedConstant extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo: replace optPrio with plusPrio when its implemented, below is a workaround
    return seq(reg(/^`.*`$/), str("&"), reg(/^`.*`$/),
               optPrio(seq(str("&"), reg(/^`.*`$/))),
               optPrio(seq(str("&"), reg(/^`.*`$/))),
               optPrio(seq(str("&"), reg(/^`.*`$/))));
  }
}