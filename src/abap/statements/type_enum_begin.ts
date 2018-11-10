import {Statement} from "./_statement";
import {str, opt, seq, IRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeEnumBegin extends Statement {

  public getMatcher(): IRunnable {
    let structure = seq(str("STRUCTURE"), new NamespaceSimpleName());

    let base = seq(str("BASE TYPE"), new NamespaceSimpleName());

    let em = seq(str("ENUM"), new NamespaceSimpleName(), opt(structure), opt(base));

    let begin = seq(str("BEGIN OF"), em);

    let ret = seq(str("TYPES"), begin);

    return ret;
  }

}