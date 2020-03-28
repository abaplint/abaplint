import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("INFOTYPES"), new Constant());

    return verNot(Version.Cloud, ret);
  }

}