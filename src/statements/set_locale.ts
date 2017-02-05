import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class SetLocale extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let country = seq(str("COUNTRY"), new Reuse.Source());

    let modifier = seq(str("MODIFIER"), new Reuse.Source());

    let ret = seq(str("SET LOCALE LANGUAGE"),
                  new Reuse.Source(),
                  opt(country),
                  opt(modifier));

    return ret;
  }

}