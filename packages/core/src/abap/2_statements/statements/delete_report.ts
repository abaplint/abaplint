import {IStatement} from "./_statement";
import {verNot, seqs, optPrios} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seqs("STATE", Source);

    const ret = seqs("DELETE REPORT",
                     Source,
                     optPrios(state));

    return verNot(Version.Cloud, ret);
  }

}