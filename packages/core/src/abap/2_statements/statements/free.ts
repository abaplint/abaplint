import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Free implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("FREE"), new Target());

    return verNot(Version.Cloud, ret);
  }

}