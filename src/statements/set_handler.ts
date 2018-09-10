import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, plus, IRunnable} from "../combi";
import {Target} from "../expressions";

export class SetHandler extends Statement {

  public static get_matcher(): IRunnable {
    let activation = seq(str("ACTIVATION"), new Reuse.Source());

    let fo = seq(str("FOR"), alt(str("ALL INSTANCES"), new Reuse.Source()));

    let ret = seq(str("SET HANDLER"),
                  plus(new Target()),
                  opt(fo),
                  opt(activation));

    return ret;
  }

}