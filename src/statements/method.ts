import { Statement } from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let reg = Combi.regex;

export class Method extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("METHOD"), reg(/[\w~]+/));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}