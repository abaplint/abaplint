import {IStatement} from "./_statement";
import {verNot, str, seq, regex as reg, plus, altPrio} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";

export class SystemCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const anyy = reg(/^.+$/);

    const objmgr = seq(str("OBJMGR CLONE"), new Source(), str("TO"), new Target());

    const ret = seq(str("SYSTEM-CALL"), altPrio(objmgr, plus(anyy)));

    return verNot(Version.Cloud, ret);
  }

}