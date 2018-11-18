import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, per, plus, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class ModifyLine extends Statement {

  public getMatcher(): IRunnable {

    const form = seq(alt(str("INVERSE"), str("INPUT")),
                     str("="),
                     new Source());

    const value = seq(str("FIELD VALUE"), plus(new Source()));
    const format = seq(str("FIELD FORMAT"), new Source(), opt(form));
    const from = seq(str("FROM"), new Source());
    const lineValue = seq(str("LINE VALUE FROM"), new Source());
    const index = seq(str("INDEX"), new Source());
    const page = seq(str("OF PAGE"), new Source());
    const ocp = str("OF CURRENT PAGE");
    const lineFormat = seq(str("LINE FORMAT"),
                           alt(str("INPUT OFF"), str("RESET"), str("INTENSIFIED")));
    const onOff = alt(str("ON"), str("OFF"));
    const intensified = seq(str("INTENSIFIED"), onOff);
    const color = seq(str("COLOR"), new Source());

    const options = per(index, value, from, format, page, lineFormat, lineValue, ocp, intensified, color);

    const ret = seq(str("MODIFY"),
                    alt(str("CURRENT LINE"),
                        seq(str("LINE"), new Source())),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}