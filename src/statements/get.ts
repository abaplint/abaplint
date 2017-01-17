import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let per = Combi.per;
let opt = Combi.opt;
let plus = Combi.plus;

export class Get extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let fields = seq(str("FIELDS"), plus(new Reuse.Field()));

    let options = per(str("LATE"), fields);

    let ret = seq(str("GET"),
                  new Reuse.Target(),
                  opt(options));

    return ret;
  }

}