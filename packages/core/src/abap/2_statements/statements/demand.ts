import {IStatement} from "./_statement";
import {verNotLang, seq, opt, plus} from "../combi";
import {Target, Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Demand implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(Field, "=", Target);

    const messages = seq("MESSAGES INTO", Target);

    const ret = seq("DEMAND",
                    plus(field),
                    "FROM CONTEXT",
                    Field,
                    opt(messages));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
