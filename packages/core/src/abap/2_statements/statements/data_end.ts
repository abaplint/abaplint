import {IStatement} from "./_statement";
import {str, seq, alt, optPrio} from "../combi";
import {DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class DataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const common = seq(str("COMMON PART"), optPrio(new DefinitionName()));

    const structure = seq(str("END OF"),
                          alt(common, new DefinitionName()));

    return seq(str("DATA"), structure);
  }

}