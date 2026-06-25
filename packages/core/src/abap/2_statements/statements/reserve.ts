import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Reserve implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("RESERVE", Source, "LINES");

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
