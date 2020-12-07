import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Search implements IStatement {

  public getMatcher(): IStatementRunnable {
    const starting = seq("STARTING AT", Source);
    const ending = seq("ENDING AT", Source);
    const mark = str("AND MARK");

    const mode = alt("IN BYTE MODE", "IN CHARACTER MODE");

    const ret = seq("SEARCH",
                    Source,
                    "FOR",
                    Source,
                    opt(per(mode, starting, ending, mark)));

    return verNot(Version.Cloud, ret);
  }

}