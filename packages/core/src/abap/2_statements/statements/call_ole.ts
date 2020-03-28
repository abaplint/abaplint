import {IStatement} from "./_statement";
import {verNot, str, seq, opt, regex, plus} from "../combi";
import {Target, Source, Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq(regex(/^#?\w+$/), str("="), new Source());

    const exporting = seq(str("EXPORTING"), plus(fields));

    const rc = seq(str("="), new Target());

    const ret = seq(str("CALL METHOD OF"),
                    new Source(),
                    new Constant(),
                    opt(rc),
                    opt(str("NO FLUSH")),
                    opt(str("QUEUEONLY")),
                    opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}