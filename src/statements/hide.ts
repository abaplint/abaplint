import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Hide extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("HIDE"),
               new Source());
  }

}