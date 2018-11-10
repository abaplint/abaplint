import {Statement} from "./_statement";
import {str, opt, seq, IRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeEnumEnd extends Statement {

  public getMatcher(): IRunnable {
    let structure = seq(str("STRUCTURE"), new NamespaceSimpleName());

    let em = seq(str("ENUM"), new NamespaceSimpleName(), opt(structure));

    let end = seq(str("END OF"), em);

    let ret = seq(str("TYPES"), end);

    return ret;
  }

}