import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, per, plus, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class ModifyLine extends Statement {

  public getMatcher(): IRunnable {

    let form = seq(alt(str("INVERSE"), str("INPUT")),
                   str("="),
                   new Source());

    let value = seq(str("FIELD VALUE"), plus(new Source()));
    let format = seq(str("FIELD FORMAT"), new Source(), opt(form));
    let from = seq(str("FROM"), new Source());
    let lineValue = seq(str("LINE VALUE FROM"), new Source());
    let index = seq(str("INDEX"), new Source());
    let page = seq(str("OF PAGE"), new Source());
    let ocp = str("OF CURRENT PAGE");
    let lineFormat = seq(str("LINE FORMAT"),
                         alt(str("INPUT OFF"), str("RESET"), str("INTENSIFIED")));
    let onOff = alt(str("ON"), str("OFF"));
    let intensified = seq(str("INTENSIFIED"), onOff);
    let color = seq(str("COLOR"), new Source());

    let options = per(index, value, from, format, page, lineFormat, lineValue, ocp, intensified, color);

    let ret = seq(str("MODIFY"),
                  alt(str("CURRENT LINE"),
                      seq(str("LINE"), new Source())),
                  opt(options));

    return verNot(Version.Cloud, ret);
  }

}