import {IStatement} from "./_statement";
import {verNot} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CheckSelectOptions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = "CHECK SELECT-OPTIONS";

    return verNot(Version.Cloud, ret);
  }

}