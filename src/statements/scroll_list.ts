import {Statement} from "./statement";
import {str, seq, alt, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class ScrollList extends Statement {

  public static get_matcher(): IRunnable {
    let index = seq(str("INDEX"), new Reuse.Source());
    let line = seq(str("LINE"), new Reuse.Source());
    let column = seq(str("TO COLUMN"), new Reuse.Source());

    let to = seq(str("TO"),
                 alt(str("FIRST PAGE"),
                     str("LAST PAGE"),
                     seq(str("PAGE"), new Reuse.Source())));

    let ret = seq(str("SCROLL LIST"),
                  per(index,
                      alt(to, str("BACKWARD"), str("FORWARD")),
                      column,
                      line));

    return ret;
  }

}