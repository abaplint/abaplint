import {IStatement} from "./_statement";
import {verNot, str, seqs, alts, opts, pers, plus, optPrios} from "../combi";
import {Source, Color} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyLine implements IStatement {

  public getMatcher(): IStatementRunnable {

    const form = seqs(alts("INVERSE", "INPUT"),
                      "=",
                      Source);

    const from = seqs("FROM", Source);
    const value = seqs("FIELD VALUE", plus(seqs(Source, optPrios(from))));
    const format = seqs("FIELD FORMAT", Source, opts(form));
    const lineValue = seqs("LINE VALUE FROM", Source);
    const index = seqs("INDEX", Source);
    const page = seqs("OF PAGE", Source);
    const ocp = str("OF CURRENT PAGE");
    const lineFormat = seqs("LINE FORMAT",
                            alts("INPUT OFF", "RESET", "INTENSIFIED"));
    const onOff = alts("ON", "OFF");
    const intensified = seqs("INTENSIFIED", onOff);

    const options = pers(index, value, format, page, lineFormat, lineValue, ocp, intensified, Color);

    const ret = seqs("MODIFY",
                     alts("CURRENT LINE",
                          seqs("LINE", Source)),
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}