import {IStatement} from "./_statement";
import {verNot, str} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndEnhancement implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDENHANCEMENT");

    return verNot(Version.Cloud, ret);
  }

}