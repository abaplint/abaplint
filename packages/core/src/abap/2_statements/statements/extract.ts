import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Extract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("EXTRACT"), opt(new Field()));

    return verNot(Version.Cloud, ret);
  }

}