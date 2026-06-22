import {IStatement} from "./_statement";
import {verNotLang, seq, optPrio} from "../combi";
import {WriteOffsetLength} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Uline implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ULINE", optPrio(WriteOffsetLength), optPrio("NO-GAP"));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
