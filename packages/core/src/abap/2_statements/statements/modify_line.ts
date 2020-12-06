import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt, per, plus, optPrio} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyLine implements IStatement {

  public getMatcher(): IStatementRunnable {

    const form = seq(alt("INVERSE", "INPUT"),
                     "=",
                     Source);

    const from = seq("FROM", Source);
    const value = seq("FIELD VALUE", plus(seq(Source, optPrio(from))));
    const format = seq("FIELD FORMAT", Source, opt(form));
    const lineValue = seq("LINE VALUE FROM", Source);
    const index = seq("INDEX", Source);
    const page = seq("OF PAGE", Source);
    const ocp = str("OF CURRENT PAGE");
    const lineFormat = seq("LINE FORMAT",
                           alt("INPUT OFF", "RESET", "INTENSIFIED"));
    const onOff = alt("ON", "OFF");
    const intensified = seq("INTENSIFIED", onOff);

    const options = per(index, value, format, page, lineFormat, lineValue, ocp, intensified, Color);

    const ret = seq("MODIFY",
                    alt("CURRENT LINE",
                        seq("LINE", Source)),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}