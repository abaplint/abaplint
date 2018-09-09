import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class FreeObject extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FREE OBJECT"),
               new Reuse.Target(),
               opt(str("NO FLUSH")));
  }

}