import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetParameter implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("GET PARAMETER ID",
                     Source,
                     "FIELD",
                     Target);

    return verNot(Version.Cloud, ret);
  }

}