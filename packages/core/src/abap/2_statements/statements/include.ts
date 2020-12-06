import {IStatement} from "./_statement";
import {verNot, str, seqs, opt} from "../combi";
import {IncludeName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Include implements IStatement {
  public getMatcher(): IStatementRunnable {
    const ret = seqs("INCLUDE", IncludeName, opt(str("IF FOUND")));

    return verNot(Version.Cloud, ret);
  }
}