import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Field, FieldSub} from "../expressions";
import {Version} from "../version";

export class EnhancementPoint extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ENHANCEMENT-POINT"),
                  new FieldSub(),
                  str("SPOTS"),
                  new Field(),
                  opt(str("STATIC")),
                  opt(str("INCLUDE BOUND")));

    return verNot(Version.Cloud, ret);
  }

}