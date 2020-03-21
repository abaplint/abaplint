import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, plus} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AuthorityCheck implements IStatement {

  public getMatcher(): IStatementRunnable {

    const field = seq(str("FIELD"), new Source());

    const id = seq(str("ID"),
                   new Source(),
                   alt(field, str("DUMMY")));

    const ret = seq(str("AUTHORITY-CHECK OBJECT"),
                    new Source(),
                    opt(seq(str("FOR USER"), new Source())),
                    plus(id));

    return verNot(Version.Cloud, ret);
  }

}