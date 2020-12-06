import {IStatement} from "./_statement";
import {seqs, opts, altPrios, optPrios, pers} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seqs("DELETING", altPrios("LEADING", "TRAILING"), Source);
    const up = seqs("UP TO", Source);
    const mode = seqs("IN", altPrios("CHARACTER", "BYTE"), "MODE");
    const dir = altPrios("LEFT", "RIGHT");
    const by = seqs("BY", Source, optPrios("PLACES"));

    const options = pers(deleting, up, mode, dir, by, "CIRCULAR");

    return seqs("SHIFT",
                Target,
                opts(options));
  }

}