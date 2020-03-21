import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";

export class BreakId implements IStatement {

  public getMatcher(): IStatementRunnable {
    const id = seq(str("ID"), new Field());

    const ret = seq(str("BREAK-POINT"), id);

    return verNot(Version.Cloud, ret);
  }

}