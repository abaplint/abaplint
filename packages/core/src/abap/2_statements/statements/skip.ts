import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Skip implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SKIP",
                    opt("TO LINE"),
                    opt(Source));

    return verNot(Version.Cloud, ret);
  }

}