import {IStatement} from "./_statement";
import {seqs, alts, opts} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class StaticBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seqs("OCCURS", Integer);

    const ret = seqs(alts("STATIC", "STATICS"),
                     "BEGIN OF",
                     DefinitionName,
                     opts(occurs));

    return ret;
  }

}