import {IStatement} from "./_statement";
import {str, seq, alt, optPrio, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class ClassDataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {

    const common = seq(str("COMMON PART"), optPrio(new NamespaceSimpleName()));

    const structure = seq(str("END OF"),
                          alt(common, new NamespaceSimpleName()));

    return seq(str("CLASS-DATA"), structure);
  }

}