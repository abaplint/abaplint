import {Statement} from "./statement";
import {Try} from "./try";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;
let plus = Combi.plus;

export class Catch extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CATCH"),
               plus(new Reuse.Field()),
               opt(seq(str("INTO"), new Reuse.Target())));
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Try;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}