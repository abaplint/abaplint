import {IStatement} from "./_statement";
import {verNot, str, seq, opt, plus, optPrio, IStatementRunnable} from "../combi";
import {Field, FieldSub, Constant, Source} from "../expressions";
import {Version} from "../../../version";

export class CallDialog implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq(new FieldSub(), optPrio(seq(str("FROM"), new Source())));
    const exporting = seq(str("EXPORTING"), plus(from));

    const to = seq(new Field(), optPrio(seq(str("TO"), new Field())));
    const importing = seq(str("IMPORTING"), plus(to));

    const ret = seq(str("CALL DIALOG"),
                    new Constant(),
                    opt(exporting),
                    opt(importing));

    return verNot(Version.Cloud, ret);
  }

}