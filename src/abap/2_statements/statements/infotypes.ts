import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Constant} from "../expressions";
import {Version} from "../../../version";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("INFOTYPES"), new Constant());

    return verNot(Version.Cloud, ret);
  }

}