import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Nodes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("NODES", Field);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
