import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class GetBadi extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let filters = seq(str("FILTERS"), new Reuse.ParameterListS());
    let context = seq(str("CONTEXT"), new Reuse.Source());
    let type = seq(str("TYPE"), new Reuse.Dynamic());

    let ret = seq(str("GET BADI"),
                  new Reuse.Target(),
                  opt(type),
                  opt(filters),
                  opt(context));

    return ret;
  }

}