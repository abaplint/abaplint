import {IStatement} from "./_statement";
import {verNot, seq, alt} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetExtendedCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET EXTENDED CHECK", alt("OFF", "ON"));

    return verNot(Version.Cloud, ret);
  }

}