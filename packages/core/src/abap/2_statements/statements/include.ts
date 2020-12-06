import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {IncludeName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Include implements IStatement {
  public getMatcher(): IStatementRunnable {
    const ret = seq("INCLUDE", IncludeName, opts("IF FOUND"));

    return verNot(Version.Cloud, ret);
  }
}