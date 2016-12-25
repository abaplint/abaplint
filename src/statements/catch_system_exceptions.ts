import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let plus = Combi.plus;

export class CatchSystemExceptions extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CATCH SYSTEM-EXCEPTIONS"),
               plus(seq(new Reuse.Field(), str("="), new Reuse.Integer())));
  }

  public isStructure() {
    return true;
  }

  public isValidParent() {
    return true;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}