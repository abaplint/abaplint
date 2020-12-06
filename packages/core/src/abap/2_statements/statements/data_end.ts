import {IStatement} from "./_statement";
import {seqs, alts, optPrio} from "../combi";
import {DefinitionName, ComponentName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const common = seqs("COMMON PART", optPrio(new DefinitionName()));

    const structure = seqs("END OF",
                           alts(common, DefinitionName));

    const valid = seqs("VALID BETWEEN", ComponentName, "AND", ComponentName);

    return seqs("DATA", structure, optPrio(valid));
  }

}