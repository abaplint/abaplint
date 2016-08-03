import { Statement } from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class Endform extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDFORM");
  }

}