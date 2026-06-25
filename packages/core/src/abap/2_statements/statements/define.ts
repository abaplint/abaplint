import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {MacroName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Define implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("DEFINE", MacroName);
    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
