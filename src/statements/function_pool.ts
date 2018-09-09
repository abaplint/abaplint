import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class FunctionPool extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FUNCTION-POOL"),
               new Reuse.Field(),
               opt(seq(str("MESSAGE-ID"), new Reuse.Source())));
  }

}