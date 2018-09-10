import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";

export class SetExtendedCheck extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET EXTENDED CHECK"), alt(str("OFF"), str("ON")));

    return ret;
  }

}