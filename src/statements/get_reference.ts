import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class GetReference extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("GET REFERENCE OF"),
                  new Reuse.Source(),
                  str("INTO"),
                  new Reuse.Target());

    return ret;
  }

}