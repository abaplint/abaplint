import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";

export class Pack implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("PACK"), new Source(), str("TO"), new Target());

    return verNot(Version.Cloud, ret);
  }

}