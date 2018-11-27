import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Search extends Statement {

  public getMatcher(): IStatementRunnable {
    const starting = seq(str("STARTING AT"), new Source());
    const ending = seq(str("ENDING AT"), new Source());
    const mark = str("AND MARK");

    const mode = alt(str("IN BYTE MODE"), str("IN CHARACTER MODE"));

    const ret = seq(str("SEARCH"),
                    new Source(),
                    str("FOR"),
                    new Source(),
                    opt(per(mode, starting, ending, mark)));

    return verNot(Version.Cloud, ret);
  }

}