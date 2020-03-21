import {IStatement} from "./_statement";
import {str, opt, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeEnumEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq(str("STRUCTURE"), new NamespaceSimpleName());

    const em = seq(str("ENUM"), new NamespaceSimpleName(), opt(structure));

    const end = seq(str("END OF"), em);

    const ret = seq(str("TYPES"), end);

    return ret;
  }

}