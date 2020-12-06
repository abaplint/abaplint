import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Search implements IStatement {

  public getMatcher(): IStatementRunnable {
    const starting = seqs("STARTING AT", Source);
    const ending = seqs("ENDING AT", Source);
    const mark = str("AND MARK");

    const mode = alt(str("IN BYTE MODE"), str("IN CHARACTER MODE"));

    const ret = seqs("SEARCH",
                     Source,
                     "FOR",
                     Source,
                     opt(per(mode, starting, ending, mark)));

    return verNot(Version.Cloud, ret);
  }

}