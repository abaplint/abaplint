import {IStatement} from "./_statement";
import {str, verNot} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndExec implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDEXEC");

    return verNot(Version.Cloud, ret);
  }

}