import {Statement} from "./statement";
import {Try} from "./try";
import {str, opt, seq, plus, IRunnable} from "../combi";
import {Target, Field} from "../expressions";

export class Catch extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CATCH"),
               plus(new Field()),
               opt(seq(str("INTO"), new Target())));
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof Try;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}