import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Endcase extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDCASE");
  }

}