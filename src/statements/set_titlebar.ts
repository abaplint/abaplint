import {Statement} from "./statement";
import {str, seq, opt, plus, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetTitlebar extends Statement {

  public static get_matcher(): IRunnable {
    let wit = seq(str("WITH"), plus(new Source()));

    let program = seq(str("OF PROGRAM"), new Source());

    let ret = seq(str("SET TITLEBAR"), new Source(), opt(program), opt(wit));

    return ret;
  }

}