import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt, per, plus, optPrio, altPrio} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const onOff = alt("ON", "OFF");
    const eq = seq("=", Source);

    const form = seq(alt("INVERSE", "INPUT", "COLOR", "HOTSPOT"), opt(alt(eq, onOff)));

    const from = seq("FROM", Source);
    const value = seq("FIELD VALUE", plus(seq(Source, optPrio(from))));
    const format = seq("FIELD FORMAT", Source, opt(form));
    const lineValue = seq("LINE VALUE FROM", Source);
    const index = seq("INDEX", Source);
    const page = seq("OF PAGE", Source);
    const ocp = str("OF CURRENT PAGE");
    const intensified = seq("INTENSIFIED", onOff);
    const intensifiedOpt = seq("INTENSIFIED", opt(onOff));
    const lineFormat = seq("LINE FORMAT",
                           per("INPUT OFF", "INVERSE", "RESET", intensifiedOpt, Color));

    const options = per(index, value, format, page, lineFormat, lineValue, ocp, intensified, Color);

    const ret = seq("MODIFY",
                    altPrio("CURRENT LINE",
                            seq("LINE", Source)),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}