import {IStatement} from "./_statement";
import {opt, seq, verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Target} from "../expressions";

export class LoopAtScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const l = seq("LOOP AT SCREEN", opt(seq("INTO", Target)));
    return verNotLang(LanguageVersion.Cloud, l);
  }

}
