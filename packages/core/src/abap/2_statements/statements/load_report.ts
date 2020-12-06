import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LoadReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("LOAD REPORT",
                     Source,
                     "PART",
                     Source,
                     "INTO",
                     Target);

    return verNot(Version.Cloud, ret);
  }

}