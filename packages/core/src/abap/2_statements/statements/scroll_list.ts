import {IStatement} from "./_statement";
import {verNot, str, seqs, alt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ScrollList implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seqs("INDEX", Source);
    const line = seqs("LINE", Source);
    const column = seqs("TO COLUMN", Source);

    const to = seqs("TO",
                    alt(str("FIRST PAGE"),
                        str("LAST PAGE"),
                        seqs("PAGE", Source)));

    const ret = seqs("SCROLL LIST",
                     per(index,
                         alt(to, str("BACKWARD"), str("FORWARD")),
                         column,
                         line));

    return verNot(Version.Cloud, ret);
  }

}