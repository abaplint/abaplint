import {IStatement} from "./_statement";
import {verNot, seq, alts, pers} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ScrollList implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seq("INDEX", Source);
    const line = seq("LINE", Source);
    const column = seq("TO COLUMN", Source);

    const to = seq("TO",
                   alts("FIRST PAGE",
                        "LAST PAGE",
                        seq("PAGE", Source)));

    const ret = seq("SCROLL LIST",
                    pers(index,
                         alts(to, "BACKWARD", "FORWARD"),
                         column,
                         line));

    return verNot(Version.Cloud, ret);
  }

}