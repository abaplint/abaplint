import {IStatement} from "./_statement";
import {str, seqs, opt, altPrio, optPrio, per} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seqs("DELETING", altPrio(str("LEADING"), str("TRAILING")), Source);
    const up = seqs("UP TO", Source);
    const mode = seqs("IN", altPrio(str("CHARACTER"), str("BYTE")), str("MODE"));
    const dir = altPrio(str("LEFT"), str("RIGHT"));
    const by = seqs("BY", Source, optPrio(str("PLACES")));

    const options = per(deleting, up, mode, dir, by, str("CIRCULAR"));

    return seqs("SHIFT",
                Target,
                opt(options));
  }

}