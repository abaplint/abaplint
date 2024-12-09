import {IStatement} from "./_statement";
import {verNot, seq, alt, per, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ScrollList implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seq("INDEX", Source);
    const line = seq("LINE", Source);
    const column = seq("TO COLUMN", Source);

    const to = seq("TO",
                   alt("FIRST PAGE",
                       "LAST PAGE",
                       seq("PAGE", Source)));

    const ret = seq("SCROLL LIST",
                    per(index,
                        alt(to, "BACKWARD", "FORWARD"),
                        seq(alt("LEFT", "RIGHT"), opt(seq("BY", Source, "PLACES"))),
                        column,
                        line));

    return verNot(Version.Cloud, ret);
  }

}