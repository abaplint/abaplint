import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class AddCorresponding extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ADD-CORRESPONDING"),
                  new Source(),
                  str("TO"),
                  new Target());

    return ret;
  }

}