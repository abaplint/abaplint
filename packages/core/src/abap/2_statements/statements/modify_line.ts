import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt, per, plus, optPrio} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyLine implements IStatement {

  public getMatcher(): IStatementRunnable {

    const form = seq(alt(str("INVERSE"), str("INPUT")),
                     str("="),
                     new Source());

    const from = seq(str("FROM"), new Source());
    const value = seq(str("FIELD VALUE"), plus(seq(new Source(), optPrio(from))));
    const format = seq(str("FIELD FORMAT"), new Source(), opt(form));
    const lineValue = seq(str("LINE VALUE FROM"), new Source());
    const index = seq(str("INDEX"), new Source());
    const page = seq(str("OF PAGE"), new Source());
    const ocp = str("OF CURRENT PAGE");
    const lineFormat = seq(str("LINE FORMAT"),
                           alt(str("INPUT OFF"), str("RESET"), str("INTENSIFIED")));
    const onOff = alt(str("ON"), str("OFF"));
    const intensified = seq(str("INTENSIFIED"), onOff);

    const options = per(index, value, format, page, lineFormat, lineValue, ocp, intensified, new Color());

    const ret = seq(str("MODIFY"),
                    alt(str("CURRENT LINE"),
                        seq(str("LINE"), new Source())),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}