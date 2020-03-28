import {IStatement} from "./_statement";
import {verNot, seq, str} from "../combi";
import {Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq(str("SET PROPERTY OF"),
                    new Source(),
                    new Constant(),
                    str("="),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}