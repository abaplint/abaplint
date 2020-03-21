import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";

export class GetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("GET RUN TIME FIELD"), new Target());

    return verNot(Version.Cloud, ret);
  }

}