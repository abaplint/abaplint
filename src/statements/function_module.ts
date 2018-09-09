import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class FunctionModule extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FUNCTION"), new Reuse.Field());
  }

  public indentationEnd() {
    return 2;
  }

}