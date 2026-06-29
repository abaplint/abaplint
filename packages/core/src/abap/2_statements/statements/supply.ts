import {IStatement} from "./_statement";
import {verNotLang, seq, plus} from "../combi";
import {Source, Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Supply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(Field, "=", Source);

    const ret = seq("SUPPLY",
                    plus(field),
                    "TO CONTEXT",
                    Field);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
