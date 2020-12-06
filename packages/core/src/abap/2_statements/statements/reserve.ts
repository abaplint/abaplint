import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Reserve implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("RESERVE", Source, "LINES");

    return verNot(Version.Cloud, ret);
  }

}