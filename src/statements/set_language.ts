import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SetLanguage extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET LANGUAGE"),
                  new Reuse.Source());

    return ret;
  }

}