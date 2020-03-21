import {IStatement} from "./_statement";
import {str, verNot, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class EndExec implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDEXEC");

    return verNot(Version.Cloud, ret);
  }

}