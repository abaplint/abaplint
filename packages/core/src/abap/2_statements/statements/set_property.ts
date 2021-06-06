import {IStatement} from "./_statement";
import {verNot, seq, optPrio, plus, opt, alt, regex as reg} from "../combi";
import {Source, Constant, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {

    const fields = seq(reg(/^[&_!#\*]?[\w\d\*%\$\?#]+$/), "=", Source);
    const exporting = seq("EXPORTING", plus(fields));

    const ret = seq("SET PROPERTY OF",
                    Source,
                    alt(Constant, Field),
                    "=",
                    Source,
                    optPrio("NO FLUSH"),
                    opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}