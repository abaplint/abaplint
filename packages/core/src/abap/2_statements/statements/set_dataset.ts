import {IStatement} from "./_statement";
import {verNotLang, seq, alt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET DATASET", Source, "POSITION", alt(Source, "END OF FILE"));
    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
