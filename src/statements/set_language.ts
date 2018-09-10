import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SetLanguage extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET LANGUAGE"),
                  new Reuse.Source());

    return ret;
  }

}