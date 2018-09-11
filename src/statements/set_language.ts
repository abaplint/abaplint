import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetLanguage extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET LANGUAGE"),
                  new Source());

    return ret;
  }

}