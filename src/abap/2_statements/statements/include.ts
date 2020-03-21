import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {IncludeName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Include implements IStatement {
  public getMatcher(): IStatementRunnable {
    const ret = seq(str("INCLUDE"), new IncludeName(), opt(str("IF FOUND")));

    return verNot(Version.Cloud, ret);
  }
}