import {IStatement} from "./_statement";
import {ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class EndWith implements IStatement {

  public getMatcher(): IStatementRunnable {
    return ver(Version.v751, "ENDWITH");
  }

}