import {Statement} from "./statement";
import * as Combi from "../combi";

export class Return extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("RETURN");
  }

}