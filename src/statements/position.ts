import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Position extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("POSITION"), new Source());
  }

}