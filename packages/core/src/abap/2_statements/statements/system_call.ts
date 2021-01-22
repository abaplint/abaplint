import {IStatement} from "./_statement";
import {verNot, seq, regex as reg, plus, altPrio} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";

export class SystemCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const anyy = reg(/^.+$/);

    const objmgr = seq("OBJMGR CLONE", Source, "TO", Target);
    const did = seq(anyy, "DID", Source, "PARAMETERS", Source, Source, Source);

    const ret = seq("SYSTEM-CALL", altPrio(objmgr, did, plus(anyy)));

    return verNot(Version.Cloud, ret);
  }

}