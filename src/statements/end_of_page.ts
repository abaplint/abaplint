import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndOfPage extends Statement {

  public static get_matcher(): IRunnable {
    return str("END-OF-PAGE");
  }

}