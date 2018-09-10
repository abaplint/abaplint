import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SetCountry extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET COUNTRY"), new Reuse.Source());
    return ret;
  }

}