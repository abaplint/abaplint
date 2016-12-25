import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class SetExtendedCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET EXTENDED CHECK"), alt(str("OFF"), str("ON")));

    return ret;
  }

}