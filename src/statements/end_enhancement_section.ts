import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndEnhancementSection extends Statement {

  public static get_matcher(): IRunnable {
    return str("END-ENHANCEMENT-SECTION");
  }

}