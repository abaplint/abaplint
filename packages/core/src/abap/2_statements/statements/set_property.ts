import {IStatement} from "./_statement";
import {verNot, seq, optPrio} from "../combi";
import {Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("SET PROPERTY OF",
                    Source,
                    Constant,
                    "=",
                    Source,
                    optPrio("NO FLUSH"));

    return verNot(Version.Cloud, ret);
  }

}