import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source, FieldSub, OLEExporting} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("GET PROPERTY OF",
                    FieldSub,
                    Source,
                    "=",
                    Source,
                    opt("NO FLUSH"),
                    opt(OLEExporting));

    return verNot(Version.Cloud, ret);
  }

}