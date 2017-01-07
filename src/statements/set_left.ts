import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class SetLeft extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("SET LEFT SCROLL-BOUNDARY");
  }

}