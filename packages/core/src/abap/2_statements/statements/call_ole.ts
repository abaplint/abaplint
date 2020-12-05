import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, regex, plus} from "../combi";
import {Target, Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seqs(regex(/^#?\w+$/), str("="), Source);

    const exporting = seqs("EXPORTING", plus(fields));

    const rc = seqs("=", Target);

    const ret = seqs("CALL METHOD OF",
                     Source,
                     Constant,
                     opt(rc),
                     opt(str("NO FLUSH")),
                     opt(str("QUEUEONLY")),
                     opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}