import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Version} from "../../../version";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Put implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("PUT"), new Field());

    return verNot(Version.Cloud, ret);
  }

}