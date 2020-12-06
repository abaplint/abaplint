import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seqs("SET PROPERTY OF",
                     Source,
                     Constant,
                     "=",
                     Source);

    return verNot(Version.Cloud, ret);
  }

}