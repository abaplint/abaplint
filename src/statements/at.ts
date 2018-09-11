import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";
import {FieldSymbol, FieldSub, Dynamic} from "../expressions";

export class At extends Statement {

  public static get_matcher(): IRunnable {
    let field = alt(new FieldSub(),
                    new Dynamic(),
                    new FieldSymbol());

    let atNew = seq(str("NEW"), field);
    let atEnd = seq(str("END OF"), field);

    let ret = seq(str("AT"), alt(str("FIRST"), str("LAST"), atNew, atEnd));

    return ret;
  }

  public isStructure() {
    return true;
  }

  public indentationEnd(_prev) {
    return 2;
  }

}