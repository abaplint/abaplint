import {IStatement} from "./_statement";
import {verNotLang, seq, altPrio, starPrio} from "../combi";
import {Constant, Field, KernelId} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallKernel implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CALL",
                    altPrio(Constant, Field),
                    starPrio(KernelId));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
