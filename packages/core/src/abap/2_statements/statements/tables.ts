import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Tables implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("TABLES"), new Field());

    return verNot(Version.Cloud, ret);
  }

}