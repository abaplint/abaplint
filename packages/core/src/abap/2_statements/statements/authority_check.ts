import {IStatement} from "./_statement";
import {seq, opt, alt, plus, verNotLang} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AuthorityCheck implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq("FIELD", Source);

    const id = seq("ID",
                   Source,
                   alt(field, "DUMMY"));

    const ret = seq("AUTHORITY-CHECK OBJECT",
                    Source,
                    opt(seq("FOR USER", Source)),
                    plus(id));

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}