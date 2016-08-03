import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Search extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SEARCH"), Reuse.source(), str("FOR"), Reuse.source());
    return ret;
  }

}