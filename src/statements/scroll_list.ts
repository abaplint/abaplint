import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let per = Combi.per;

export class ScrollList extends Statement {

  public static get_matcher(): Combi.IRunnable {
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