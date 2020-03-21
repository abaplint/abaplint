import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable, opt} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";

export class Extract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("EXTRACT"), opt(new Field()));

    return verNot(Version.Cloud, ret);
  }

}