import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetScreen extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET SCREEN"), new Source());
    return ret;
  }

}