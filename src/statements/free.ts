import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Free extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FREE"), new Target());
  }

}