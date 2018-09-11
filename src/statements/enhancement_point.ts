import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Field, FieldSub} from "../expressions";

export class EnhancementPoint extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("ENHANCEMENT-POINT"),
               new FieldSub(),
               str("SPOTS"),
               new Field(),
               opt(str("STATIC")),
               opt(str("INCLUDE BOUND")));
  }

}