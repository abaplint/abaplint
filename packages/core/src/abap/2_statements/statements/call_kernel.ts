import {IStatement} from "./_statement";
import {verNot, seq, altPrio, starPrio} from "../combi";
import {Constant, Field, KernelId} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallKernel implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CALL",
                    altPrio(Constant, Field),
                    starPrio(KernelId));

    return verNot(Version.Cloud, ret);
  }

}