import {IStatement} from "./_statement";
import {verNot, str} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LoadOfProgram implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("LOAD-OF-PROGRAM");

    return verNot(Version.Cloud, ret);
  }

}