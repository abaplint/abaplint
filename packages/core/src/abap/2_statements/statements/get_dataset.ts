import {IStatement} from "./_statement";
import {verNotLang, seq, opt, per} from "../combi";
import {Source, Target} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const position = seq("POSITION", Target);
    const attr = seq("ATTRIBUTES", Target);

    const ret = seq("GET DATASET",
                    Source,
                    opt(per(position, attr)));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
