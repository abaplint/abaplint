import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const language = seq("LANGUAGE", Source);
    const state = seq("STATE", Source);

    const ret = seq("DELETE TEXTPOOL",
                    Source,
                    opt(language),
                    opt(state));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
