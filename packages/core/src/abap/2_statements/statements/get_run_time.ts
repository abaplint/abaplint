import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("GET RUN TIME FIELD", Target);

    return verNot(Version.Cloud, ret);
  }

}