import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class BreakId implements IStatement {

  public getMatcher(): IStatementRunnable {
    const id = seq("ID", Field);

    const ret = seq("BREAK-POINT", id);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
