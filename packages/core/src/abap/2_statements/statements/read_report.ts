import {IStatement} from "./_statement";
import {verNot, seqs, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seqs("STATE", Source);
    const into = seqs("INTO", Target);
    const maximum = seqs("MAXIMUM WIDTH INTO", Target);

    const ret = seqs("READ REPORT",
                     Source,
                     pers(state, into, maximum));

    return verNot(Version.Cloud, ret);
  }

}