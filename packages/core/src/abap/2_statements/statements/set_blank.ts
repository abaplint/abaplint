import {IStatement} from "./_statement";
import {verNotLang, alt, seq} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetBlank implements IStatement {

  public getMatcher(): IStatementRunnable {
    const onOff = alt("ON", "OFF");

    const ret = seq("SET BLANK LINES", onOff);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
