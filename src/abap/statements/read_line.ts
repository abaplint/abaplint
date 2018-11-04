import {Statement} from "./_statement";
import {verNot, str, seq, per, opt, alt, plus, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class ReadLine extends Statement {

  public getMatcher(): IRunnable {
    let val = seq(str("LINE VALUE INTO"),
                  new Target());

    let fields = seq(new Target(), opt(seq(str("INTO"), new Target())));

    let field = seq(str("FIELD VALUE"),
                    plus(fields));

    let index = seq(str("INDEX"), new Source());

    let page = seq(str("OF PAGE"), new Source());

    let current = str("OF CURRENT PAGE");

    let ret = seq(str("READ"),
                  alt(str("CURRENT LINE"), seq(str("LINE"), new Source())),
                  opt(per(val, index, field, page, current)));

    return verNot(Version.Cloud, ret);
  }

}