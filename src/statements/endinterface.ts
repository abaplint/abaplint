import { Statement } from "./statement";
import * as Combi from "../combi";

export class Endinterface extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ENDINTERFACE");
  }

}