import {IStatement} from "./_statement";
import {verNotLang, seq, optPrio, regex} from "../combi";
import {Constant, FieldSub, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Constant);
    const name = seq("NAME", FieldSub);
    const mode = "MODE N";
    const valid = seq("VALID FROM", Source, "TO", Source);

    const ret = seq("INFOTYPES", regex(/^\d\d\d\d$/), optPrio(valid), optPrio(name), optPrio(occurs), optPrio(mode));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
