import {IStatement} from "./_statement";
import {verNotLang, seq, star} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OnChange implements IStatement {

  public getMatcher(): IStatementRunnable {
    const or = seq("OR", Source);

    const ret = seq("ON CHANGE OF", Source, star(or));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
