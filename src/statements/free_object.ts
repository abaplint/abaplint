import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class FreeObject extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FREE OBJECT"),
               new Target(),
               opt(str("NO FLUSH")));
  }

}