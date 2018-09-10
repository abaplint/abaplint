import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SetUserCommand extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET USER-COMMAND"), new Reuse.Source());

    return ret;
  }

}