import {Statement} from "./_statement";
import {verNot, str, seq, alt, per, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class ScrollList extends Statement {

  public getMatcher(): IStatementRunnable {
    const index = seq(str("INDEX"), new Source());
    const line = seq(str("LINE"), new Source());
    const column = seq(str("TO COLUMN"), new Source());

    const to = seq(str("TO"),
                   alt(str("FIRST PAGE"),
                       str("LAST PAGE"),
                       seq(str("PAGE"), new Source())));

    const ret = seq(str("SCROLL LIST"),
                    per(index,
                        alt(to, str("BACKWARD"), str("FORWARD")),
                        column,
                        line));

    return verNot(Version.Cloud, ret);
  }

}