import {IStatement} from "./_statement";
import {seq, opt, altPrio, optPrios, pers} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seq("DELETING", altPrio("LEADING", "TRAILING"), Source);
    const up = seq("UP TO", Source);
    const mode = seq("IN", altPrio("CHARACTER", "BYTE"), "MODE");
    const dir = altPrio("LEFT", "RIGHT");
    const by = seq("BY", Source, optPrios("PLACES"));

    const options = pers(deleting, up, mode, dir, by, "CIRCULAR");

    return seq("SHIFT",
               Target,
               opt(options));
  }

}