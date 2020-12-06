import {IStatement} from "./_statement";
import {seq, opts, altPrios, optPrios, pers} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seq("DELETING", altPrios("LEADING", "TRAILING"), Source);
    const up = seq("UP TO", Source);
    const mode = seq("IN", altPrios("CHARACTER", "BYTE"), "MODE");
    const dir = altPrios("LEFT", "RIGHT");
    const by = seq("BY", Source, optPrios("PLACES"));

    const options = pers(deleting, up, mode, dir, by, "CIRCULAR");

    return seq("SHIFT",
               Target,
               opts(options));
  }

}