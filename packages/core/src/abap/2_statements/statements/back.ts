import {IStatement} from "./_statement";
import {verNot, str} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Back implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("BACK");

    return verNot(Version.Cloud, ret);
  }

}