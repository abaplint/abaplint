import {IStatement} from "./_statement";
import {verNot, str, seq, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seq(str("STATE"), new Source());
    const into = seq(str("INTO"), new Target());
    const maximum = seq(str("MAXIMUM WIDTH INTO"), new Target());

    const ret = seq(str("READ REPORT"),
                    new Source(),
                    per(state, into, maximum));

    return verNot(Version.Cloud, ret);
  }

}