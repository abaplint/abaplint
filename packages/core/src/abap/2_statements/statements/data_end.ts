import {IStatement} from "./_statement";
import {seq, alts, optPrios} from "../combi";
import {DefinitionName, ComponentName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const common = seq("COMMON PART", optPrios(DefinitionName));

    const structure = seq("END OF",
                          alts(common, DefinitionName));

    const valid = seq("VALID BETWEEN", ComponentName, "AND", ComponentName);

    return seq("DATA", structure, optPrios(valid));
  }

}