import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, plus, IRunnable} from "../combi";

export class SetTitlebar extends Statement {

  public static get_matcher(): IRunnable {
    let wit = seq(str("WITH"), plus(new Reuse.Source()));

    let program = seq(str("OF PROGRAM"), new Reuse.Source());

    let ret = seq(str("SET TITLEBAR"), new Reuse.Source(), opt(program), opt(wit));

    return ret;
  }

}