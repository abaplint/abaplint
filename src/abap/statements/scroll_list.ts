import {Statement} from "./_statement";
import {verNot, str, seq, alt, per, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class ScrollList extends Statement {

  public getMatcher(): IRunnable {
    let index = seq(str("INDEX"), new Source());
    let line = seq(str("LINE"), new Source());
    let column = seq(str("TO COLUMN"), new Source());

    let to = seq(str("TO"),
                 alt(str("FIRST PAGE"),
                     str("LAST PAGE"),
                     seq(str("PAGE"), new Source())));

    let ret = seq(str("SCROLL LIST"),
                  per(index,
                      alt(to, str("BACKWARD"), str("FORWARD")),
                      column,
                      line));

    return verNot(Version.Cloud, ret);
  }

}