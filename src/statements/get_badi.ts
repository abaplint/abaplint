import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class GetBadi extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let filters = seq(str("FILTERS"), new Reuse.ParameterListS());

    let ret = seq(str("GET BADI"),
                  new Reuse.Target(),
                  opt(filters));

    return ret;
  }

}