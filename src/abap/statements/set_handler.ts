import {Statement} from "./statement";
import {str, seq, opt, alt, plus, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class SetHandler extends Statement {

  public get_matcher(): IRunnable {
    let activation = seq(str("ACTIVATION"), new Source());

    let fo = seq(str("FOR"), alt(str("ALL INSTANCES"), new Source()));

    let ret = seq(str("SET HANDLER"),
                  plus(new Target()),
                  opt(fo),
                  opt(activation));

    return ret;
  }

}