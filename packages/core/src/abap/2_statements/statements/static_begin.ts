import {IStatement} from "./_statement";
import {str, seqs, alt, opt} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seqs("OCCURS", Integer);

    const ret = seqs(alt(str("STATIC"), str("STATICS")),
                     "BEGIN OF",
                     DefinitionName,
                     opt(occurs));

    return ret;
  }

}