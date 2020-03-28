import {IStatement} from "./_statement";
import {verNot, str, seq, alt} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetExtendedCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SET EXTENDED CHECK"), alt(str("OFF"), str("ON")));

    return verNot(Version.Cloud, ret);
  }

}