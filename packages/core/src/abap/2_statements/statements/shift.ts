import {IStatement} from "./_statement";
import {str, seq, opt, altPrio, optPrio, per} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seq(str("DELETING"), altPrio(str("LEADING"), str("TRAILING")), new Source());
    const up = seq(str("UP TO"), new Source());
    const mode = seq(str("IN"), altPrio(str("CHARACTER"), str("BYTE")), str("MODE"));
    const dir = altPrio(str("LEFT"), str("RIGHT"));
    const by = seq(str("BY"), new Source(), optPrio(str("PLACES")));

    const options = per(deleting, up, mode, dir, by, str("CIRCULAR"));

    return seq(str("SHIFT"),
               new Target(),
               opt(options));
  }

}