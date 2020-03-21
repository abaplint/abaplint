import {IStatement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {SimpleName} from "../expressions";
import {Version} from "../../../version";

export class ExecSQL implements IStatement {

  public getMatcher(): IStatementRunnable {
    const performing = seq(str("PERFORMING"), new SimpleName());

    const ret = seq(str("EXEC SQL"), opt(performing));

    return verNot(Version.Cloud, ret);
  }

}