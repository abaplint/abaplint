import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ImportDynpro implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("IMPORT DYNPRO",
                     Target,
                     Target,
                     Target,
                     Target,
                     "ID",
                     Source);

    return verNot(Version.Cloud, ret);
  }

}