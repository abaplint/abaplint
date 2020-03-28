import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class BreakId implements IStatement {

  public getMatcher(): IStatementRunnable {
    const id = seq(str("ID"), new Field());

    const ret = seq(str("BREAK-POINT"), id);

    return verNot(Version.Cloud, ret);
  }

}