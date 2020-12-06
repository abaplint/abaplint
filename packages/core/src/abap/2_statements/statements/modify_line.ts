import {IStatement} from "./_statement";
import {verNot, str, seqs, alts, opt, per, plus, optPrio} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyLine implements IStatement {

  public getMatcher(): IStatementRunnable {

    const form = seqs(alts("INVERSE", "INPUT"),
                      "=",
                      Source);

    const from = seqs("FROM", Source);
    const value = seqs("FIELD VALUE", plus(seqs(Source, optPrio(from))));
    const format = seqs("FIELD FORMAT", Source, opt(form));
    const lineValue = seqs("LINE VALUE FROM", Source);
    const index = seqs("INDEX", Source);
    const page = seqs("OF PAGE", Source);
    const ocp = str("OF CURRENT PAGE");
    const lineFormat = seqs("LINE FORMAT",
                            alts("INPUT OFF", "RESET", "INTENSIFIED"));
    const onOff = alts("ON", "OFF");
    const intensified = seqs("INTENSIFIED", onOff);

    const options = per(index, value, format, page, lineFormat, lineValue, ocp, intensified, new Color());

    const ret = seqs("MODIFY",
                     alts("CURRENT LINE",
                          seqs("LINE", Source)),
                     opt(options));

    return verNot(Version.Cloud, ret);
  }

}