import {IStatement} from "./_statement";
import {opt, seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq("STRUCTURE", NamespaceSimpleName);

    const ret = seq("TYPES", "END OF", "ENUM", NamespaceSimpleName, opt(structure));

    return ret;
  }

}