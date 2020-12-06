import {IStatement} from "./_statement";
import {str, seqs, opt, altPrios, optPrio, per} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seqs("DELETING", altPrios("LEADING", "TRAILING"), Source);
    const up = seqs("UP TO", Source);
    const mode = seqs("IN", altPrios("CHARACTER", "BYTE"), "MODE");
    const dir = altPrios("LEFT", "RIGHT");
    const by = seqs("BY", Source, optPrio(str("PLACES")));

    const options = per(deleting, up, mode, dir, by, str("CIRCULAR"));

    return seqs("SHIFT",
                Target,
                opt(options));
  }

}