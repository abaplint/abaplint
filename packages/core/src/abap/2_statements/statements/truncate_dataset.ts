import {IStatement} from "./_statement";
import {seq, verNotLang} from "../combi";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class TruncateDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.Cloud, seq("TRUNCATE DATASET", Source, "AT CURRENT POSITION"));
  }

}
