import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Unpack implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("UNPACK",
                    Source,
                    "TO",
                    Target);

    return verNot(Version.Cloud, ret);
  }

}