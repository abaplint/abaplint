import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Window implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ending = seqs("ENDING AT", Source, Source);

    const ret = seqs("WINDOW STARTING AT",
                     Source,
                     Source,
                     opts(ending));

    return verNot(Version.Cloud, ret);
  }

}