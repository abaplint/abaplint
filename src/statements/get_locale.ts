import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class GetLocale extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let country = seq(str("COUNTRY"), new Reuse.Target());

    let modifier = seq(str("MODIFIER"), new Reuse.Target());

    let ret = seq(str("GET LOCALE LANGUAGE"),
                  new Reuse.Target(),
                  country,
                  opt(modifier));

    return ret;
  }

}