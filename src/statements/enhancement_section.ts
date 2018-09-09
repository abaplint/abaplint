import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class EnhancementSection extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("ENHANCEMENT-SECTION"),
               new Reuse.Field(),
               str("SPOTS"),
               new Reuse.Field(),
               opt(str("STATIC")));
  }

}