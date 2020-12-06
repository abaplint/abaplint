import {IStatement} from "./_statement";
import {verNot, seqs, alts, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ScrollList implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seqs("INDEX", Source);
    const line = seqs("LINE", Source);
    const column = seqs("TO COLUMN", Source);

    const to = seqs("TO",
                    alts("FIRST PAGE",
                         "LAST PAGE",
                         seqs("PAGE", Source)));

    const ret = seqs("SCROLL LIST",
                     per(index,
                         alts(to, "BACKWARD", "FORWARD"),
                         column,
                         line));

    return verNot(Version.Cloud, ret);
  }

}