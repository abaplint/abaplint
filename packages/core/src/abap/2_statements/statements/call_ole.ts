import {IStatement} from "./_statement";
import {verNot, seq, opts, regex, pluss} from "../combi";
import {Target, Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq(regex(/^#?\w+$/), "=", Source);

    const exporting = seq("EXPORTING", pluss(fields));

    const rc = seq("=", Target);

    const ret = seq("CALL METHOD OF",
                    Source,
                    Constant,
                    opts(rc),
                    opts("NO FLUSH"),
                    opts("QUEUEONLY"),
                    opts(exporting));

    return verNot(Version.Cloud, ret);
  }

}