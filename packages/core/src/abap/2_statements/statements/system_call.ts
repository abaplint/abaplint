import {IStatement} from "./_statement";
import {verNotLang, seq, regex as reg, plus, altPrio} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";

export class SystemCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const anyy = reg(/^.+$/);

    const objmgr = seq("OBJMGR CLONE", Source, "TO", Target);
    const did = seq(anyy, "DID", Source, "PARAMETERS", plus(Source));

    const ret = seq("SYSTEM-CALL", altPrio(objmgr, did, plus(anyy)));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
