import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../version";

export class EnhancementSection extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ENHANCEMENT-SECTION"),
                  new Field(),
                  str("SPOTS"),
                  new Field(),
                  opt(str("STATIC")));

    return verNot(Version.Cloud, ret);
  }

}