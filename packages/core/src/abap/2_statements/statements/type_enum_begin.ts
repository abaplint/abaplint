import {IStatement} from "./_statement";
import {str, opt, seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq(str("STRUCTURE"), new NamespaceSimpleName());

    const base = seq(str("BASE TYPE"), new NamespaceSimpleName());

    const em = seq(str("ENUM"), new NamespaceSimpleName(), opt(structure), opt(base));

    const begin = seq(str("BEGIN OF"), em);

    const ret = seq(str("TYPES"), begin);

    return ret;
  }

}