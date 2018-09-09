import {Statement} from "./statement";
import {Try} from "./try";
import * as Reuse from "./reuse";
import {str, opt, seq, plus, IRunnable} from "../combi";

export class Catch extends Statement {

  public static get_matcher(): IRunnable {
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