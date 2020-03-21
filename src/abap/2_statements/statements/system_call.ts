import {IStatement} from "./_statement";
import {verNot, str, seq, regex as reg, plus, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class SystemCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const anyy = reg(/^.+$/);

    const ret = seq(str("SYSTEM-CALL"), plus(anyy));

    return verNot(Version.Cloud, ret);
  }

}