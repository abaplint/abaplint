import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class OnChange extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ON CHANGE OF"),
                  new Reuse.Target());

    return ret;
  }

}