import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class OnChange extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ON CHANGE OF"), new Target());

    return ret;
  }

}