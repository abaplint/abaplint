import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";

export class FunctionModule extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FUNCTION"), new Field());
  }

  public indentationEnd() {
    return 2;
  }

}