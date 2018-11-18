import {Statement} from "./_statement";
import {str, seq, alt, IRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeBegin extends Statement {

  public getMatcher(): IRunnable {

    const begin = seq(str("BEGIN OF"), new NamespaceSimpleName());

    const ret = seq(alt(str("TYPE"), str("TYPES")), begin);

    return ret;
  }

}