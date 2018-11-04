import {Statement} from "./_statement";
import {verNot, str, seq, per, opt, plus, IRunnable} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../version";

export class Get extends Statement {

  public getMatcher(): IRunnable {
    let fields = seq(str("FIELDS"), plus(new Field()));

    let options = per(str("LATE"), fields);

    let ret = seq(str("GET"),
                  new Target(),
                  opt(options));

    return verNot(Version.Cloud, ret);
  }

}