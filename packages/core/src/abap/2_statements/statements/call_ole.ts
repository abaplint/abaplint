import {IStatement} from "./_statement";
import {verNot, seq, opt, regex, plus} from "../combi";
import {Target, Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq(regex(/^#?\w+$/), "=", Source);

    const exporting = seq("EXPORTING", plus(fields));

    const rc = seq("=", Target);

    const ret = seq("CALL METHOD OF",
                    Source,
                    Constant,
                    opt(rc),
                    opt("NO FLUSH"),
                    opt("QUEUEONLY"),
                    opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}