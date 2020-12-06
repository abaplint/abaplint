import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("GET RUN TIME FIELD", Target);

    return verNot(Version.Cloud, ret);
  }

}