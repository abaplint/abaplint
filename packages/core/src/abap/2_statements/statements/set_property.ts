import {IStatement} from "./_statement";
import {verNot, seq, optPrio, opt, alt} from "../combi";
import {Source, Constant, Field, OLEExporting} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET PROPERTY OF",
                    Source,
                    alt(Constant, Field),
                    "=",
                    Source,
                    optPrio("NO FLUSH"),
                    opt(OLEExporting));

    return verNot(Version.Cloud, ret);
  }

}