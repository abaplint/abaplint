import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetMargin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET MARGIN",
                    Source,
                    opt(Source));

    return verNot(Version.Cloud, ret);
  }

}