import {IStatement} from "./_statement";
import {seqs, alts, optPrios} from "../combi";
import {DefinitionName, ComponentName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const common = seqs("COMMON PART", optPrios(DefinitionName));

    const structure = seqs("END OF",
                           alts(common, DefinitionName));

    const valid = seqs("VALID BETWEEN", ComponentName, "AND", ComponentName);

    return seqs("DATA", structure, optPrios(valid));
  }

}