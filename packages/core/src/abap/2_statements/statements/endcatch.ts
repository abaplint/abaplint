import {IStatement} from "./_statement";
import {verNot, str} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndCatch implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDCATCH");
    return verNot(Version.Cloud, ret);
  }

}