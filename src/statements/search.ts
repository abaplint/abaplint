import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Search extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SEARCH"),
                  new Reuse.Source(),
                  str("FOR"),
                  new Reuse.Source());

    return ret;
  }

}