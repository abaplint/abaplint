import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class SetBlank extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("SET BLANK LINES ON");
  }

}