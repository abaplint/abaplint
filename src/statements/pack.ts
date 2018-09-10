import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Pack extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("PACK"), new Reuse.Source(), str("TO"), new Target());
  }

}