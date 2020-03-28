import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("GET RUN TIME FIELD"), new Target());

    return verNot(Version.Cloud, ret);
  }

}