import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Field} from "../expressions";

export class EnhancementSection extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("ENHANCEMENT-SECTION"),
               new Field(),
               str("SPOTS"),
               new Field(),
               opt(str("STATIC")));
  }

}