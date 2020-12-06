import {IStatement} from "./_statement";
import {verNot, seq, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seq("STATE", Source);
    const into = seq("INTO", Target);
    const maximum = seq("MAXIMUM WIDTH INTO", Target);

    const ret = seq("READ REPORT",
                    Source,
                    pers(state, into, maximum));

    return verNot(Version.Cloud, ret);
  }

}