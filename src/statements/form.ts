import {Statement} from "./statement";
import {str, seq, alt, opt, tok, altPrio, plus, IRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";
import {ClassName, SimpleName, NamespaceSimpleName, FormParam, FormName} from "../expressions";

export class Form extends Statement {

  public static get_matcher(): IRunnable {

    let resume = seq(str("RESUMABLE"),
                     tok(ParenLeft),
                     new ClassName(),
                     alt(tok(ParenRight), tok(ParenRightW)));

    let stru = seq(new SimpleName(),
                   str("STRUCTURE"),
                   new NamespaceSimpleName());

    let tables = seq(str("TABLES"), plus(altPrio(stru, new FormParam())));
    let using = seq(str("USING"), plus(new FormParam()));
    let changing = seq(str("CHANGING"), plus(new FormParam()));
    let raising = seq(str("RAISING"), plus(alt(new ClassName(), resume)));

    let ret = seq(str("FORM"),
                  new FormName(),
                  opt(tables),
                  opt(using),
                  opt(changing),
                  opt(raising));

    return ret;
  }

  public isStructure() {
    return true;
  }

  public indentationSetStart() {
    return 0;
  }

  public indentationEnd() {
    return 2;
  }

}