import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, alts, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Search implements IStatement {

  public getMatcher(): IStatementRunnable {
    const starting = seqs("STARTING AT", Source);
    const ending = seqs("ENDING AT", Source);
    const mark = str("AND MARK");

    const mode = alts("IN BYTE MODE", "IN CHARACTER MODE");

    const ret = seqs("SEARCH",
                     Source,
                     "FOR",
                     Source,
                     opts(per(mode, starting, ending, mark)));

    return verNot(Version.Cloud, ret);
  }

}