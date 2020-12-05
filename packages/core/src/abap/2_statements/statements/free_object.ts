import {IStatement} from "./_statement";
import {verNot, str, seqs, opt} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FreeObject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("FREE OBJECT",
                     Target,
                     opt(str("NO FLUSH")));

    return verNot(Version.Cloud, ret);
  }

}