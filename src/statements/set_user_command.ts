import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetUserCommand extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET USER-COMMAND"), new Source());

    return ret;
  }

}