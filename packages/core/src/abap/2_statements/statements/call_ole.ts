import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, regex, pluss} from "../combi";
import {Target, Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seqs(regex(/^#?\w+$/), str("="), Source);

    const exporting = seqs("EXPORTING", pluss(fields));

    const rc = seqs("=", Target);

    const ret = seqs("CALL METHOD OF",
                     Source,
                     Constant,
                     opts(rc),
                     opts("NO FLUSH"),
                     opts("QUEUEONLY"),
                     opts(exporting));

    return verNot(Version.Cloud, ret);
  }

}