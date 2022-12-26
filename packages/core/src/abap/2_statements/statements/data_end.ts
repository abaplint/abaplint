import {IStatement} from "./_statement";
import {seq, optPrio, altPrio} from "../combi";
import {DefinitionName, ComponentName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const common = seq("COMMON PART", optPrio(DefinitionName));

    const structure = seq("END OF",
                          altPrio(common, DefinitionName));

    const valid = seq("VALID BETWEEN", ComponentName, "AND", ComponentName);

    return seq("DATA", structure, optPrio(valid));
  }

}