import {IStatement} from "./_statement";
import {verNot, str, seqs, per, opts, alts, plus} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const val = seqs("LINE VALUE INTO",
                     Target);

    const fields = seqs(Target, opts(seqs("INTO", Target)));

    const field = seqs("FIELD VALUE",
                       plus(fields));

    const index = seqs("INDEX", Source);

    const page = seqs("OF PAGE", Source);

    const current = str("OF CURRENT PAGE");

    const ret = seqs("READ",
                     alts("CURRENT LINE", seqs("LINE", Source)),
                     opts(per(val, index, field, page, current)));

    return verNot(Version.Cloud, ret);
  }

}