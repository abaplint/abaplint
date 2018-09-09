import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class EnhancementPoint extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("ENHANCEMENT-POINT"),
               new Reuse.FieldSub(),
               str("SPOTS"),
               new Reuse.Field(),
               opt(str("STATIC")),
               opt(str("INCLUDE BOUND")));
  }

}