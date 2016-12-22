import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class ScrollList extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SCROLL LIST INDEX"),
                  new Reuse.Source(),
                  str("TO FIRST PAGE LINE"),
                  new Reuse.Source());

    return ret;
  }

}