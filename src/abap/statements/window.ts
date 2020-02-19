import {Statement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Window extends Statement {

  public getMatcher(): IStatementRunnable {
    const ending = seq(str("ENDING AT"), new Source(), new Source());

    const ret = seq(str("WINDOW STARTING AT"),
                    new Source(),
                    new Source(),
                    opt(ending));

    return verNot(Version.Cloud, ret);
  }

}