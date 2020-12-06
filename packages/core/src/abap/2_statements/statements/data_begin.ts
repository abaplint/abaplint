import {IStatement} from "./_statement";
import {seqs, opts} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seqs("OCCURS", Integer);

    const structure = seqs("BEGIN OF",
                           opts("COMMON PART"),
                           DefinitionName,
                           opts("READ-ONLY"),
                           opts(occurs));

    return seqs("DATA", structure);
  }

}