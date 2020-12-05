import {IStatement} from "./_statement";
import {verNot, seqs, opt} from "../combi";
import {SimpleName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ExecSQL implements IStatement {

  public getMatcher(): IStatementRunnable {
    const performing = seqs("PERFORMING", SimpleName);

    const ret = seqs("EXEC SQL", opt(performing));

    return verNot(Version.Cloud, ret);
  }

}