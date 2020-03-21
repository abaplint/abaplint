import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Window implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seq(str("ENDING AT"), new Source(), new Source());

    const ret = seq(str("WINDOW STARTING AT"),
                    new Source(),
                    new Source(),
                    opt(ending));

    return verNot(Version.Cloud, ret);
  }

}