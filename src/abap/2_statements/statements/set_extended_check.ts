import {IStatement} from "./_statement";
import {verNot, str, seq, alt, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class SetExtendedCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SET EXTENDED CHECK"), alt(str("OFF"), str("ON")));

    return verNot(Version.Cloud, ret);
  }

}