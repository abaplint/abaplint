import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Target, Source, OLEExporting} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const rc = seq("=", Target);

    const ret = seq("CALL METHOD OF",
                    Source,
                    Source,
                    opt(rc),
                    opt("NO FLUSH"),
                    opt("QUEUEONLY"),
                    opt(OLEExporting));

    return verNot(Version.Cloud, ret);
  }

}