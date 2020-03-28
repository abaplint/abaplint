import {IStatement} from "./_statement";
import {str, opt, seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq(str("STRUCTURE"), new NamespaceSimpleName());

    const em = seq(str("ENUM"), new NamespaceSimpleName(), opt(structure));

    const end = seq(str("END OF"), em);

    const ret = seq(str("TYPES"), end);

    return ret;
  }

}