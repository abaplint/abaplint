import {IStatement} from "./_statement";
import {verNot, str, seq, optPrio} from "../combi";
import {Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq(str("OCCURS"), new Constant());

    const ret = seq(str("INFOTYPES"), new Constant(), optPrio(occurs));

    return verNot(Version.Cloud, ret);
  }

}