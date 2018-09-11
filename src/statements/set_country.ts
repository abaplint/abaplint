import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetCountry extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET COUNTRY"), new Source());
    return ret;
  }

}