import {IStatement} from "./_statement";
import {str, seqs, opt} from "../combi";
import {Integer, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seqs("OCCURS", Integer);

    const structure = seqs("BEGIN OF",
                           opt(str("COMMON PART")),
                           DefinitionName,
                           opt(str("READ-ONLY")),
                           opt(occurs));

    return seqs("DATA", structure);
  }

}