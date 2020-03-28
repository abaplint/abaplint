import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const starting = seq(str("STARTING AT"), new Source(), new Source());
    const ending = seq(str("ENDING AT"), new Source(), new Source());

    const ret = seq(str("CALL SCREEN"), new Source(), opt(seq(starting, opt(ending))));

    return verNot(Version.Cloud, ret);
  }

}