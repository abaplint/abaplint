import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Pack extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("PACK"), new Source(), str("TO"), new Target());
  }

}