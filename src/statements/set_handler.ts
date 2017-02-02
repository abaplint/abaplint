import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class SetHandler extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let activation = seq(str("ACTIVATION"), new Reuse.Source());

    let fo = seq(str("FOR"), alt(str("ALL INSTANCES"), new Reuse.Source()));

    let ret = seq(str("SET HANDLER"),
                  plus(new Reuse.Target()),
                  opt(fo),
                  opt(activation));

    return ret;
  }

}