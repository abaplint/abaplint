import {IStatement} from "./_statement";
import {verNot, str} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndOn implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDON");
    return verNot(Version.Cloud, ret);
  }

}