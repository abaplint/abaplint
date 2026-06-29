import {IStatement} from "./_statement";
import {seq, ver, AlsoIn, verNotLang} from "../combi";
import {TestSeamName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release, LanguageVersion} from "../../../version";

export class TestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, ver(Release.v750, seq("TEST-SEAM", TestSeamName), {also: AlsoIn.OpenABAP}));
  }

}
