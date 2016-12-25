import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class Try extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("TRY");
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 4;
  }

}