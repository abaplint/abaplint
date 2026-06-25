import {IStatement} from "./_statement";
import {verNotLang, seq, alt} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const clock = seq("CLOCK RESOLUTION", alt("LOW", "HIGH"));

    const analyzer = seq("ANALYZER", alt("ON", "OFF"));

    const ret = seq("SET RUN TIME", alt(clock, analyzer));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
