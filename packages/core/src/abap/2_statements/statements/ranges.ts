import {IStatement} from "./_statement";
import {verNotLang, seq, optPrio} from "../combi";
import {Source, SimpleFieldChain2, FieldLength, DefinitionName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Ranges implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Source);

    const ret = seq("RANGES",
                    DefinitionName,
                    "FOR",
                    SimpleFieldChain2,
                    optPrio(occurs),
                    optPrio(FieldLength));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
