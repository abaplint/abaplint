import {IStatement} from "./_statement";
import {verNot, str, seq, regex as reg, plus} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SystemCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const anyy = reg(/^.+$/);

    const ret = seq(str("SYSTEM-CALL"), plus(anyy));

    return verNot(Version.Cloud, ret);
  }

}