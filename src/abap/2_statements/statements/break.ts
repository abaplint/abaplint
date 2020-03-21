import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, IStatementRunnable} from "../combi";
import {Field, Source} from "../expressions";
import {Version} from "../../../version";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");
    const log = new Source();

    const ret = alt(seq(str("BREAK-POINT"), opt(alt(next, log))),
                    seq(str("BREAK"), new Field()));

    return verNot(Version.Cloud, ret);
  }

}