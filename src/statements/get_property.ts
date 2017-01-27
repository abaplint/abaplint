import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class GetProperty extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let exporting = seq(str("EXPORTING"), new Reuse.ParameterListS());

    let ret = seq(str("GET PROPERTY OF"),
                  new Reuse.FieldSub(),
                  new Reuse.Field(),
                  str("="),
                  new Reuse.Source(),
                  str("NO FLUSH"),
                  opt(exporting));

    return ret;
  }

}