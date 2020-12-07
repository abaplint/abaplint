import {IStatement} from "./_statement";
import {seq, opt, altPrio, optPrio, per} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seq("DELETING", altPrio("LEADING", "TRAILING"), Source);
    const up = seq("UP TO", Source);
    const mode = seq("IN", altPrio("CHARACTER", "BYTE"), "MODE");
    const dir = altPrio("LEFT", "RIGHT");
    const by = seq("BY", Source, optPrio("PLACES"));

    const options = per(deleting, up, mode, dir, by, "CIRCULAR");

    return seq("SHIFT",
               Target,
               opt(options));
  }

}