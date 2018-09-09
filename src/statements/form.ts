import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, tok, altPrio, plus, IRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";

export class Form extends Statement {

  public static get_matcher(): IRunnable {

    let resume = seq(str("RESUMABLE"),
                     tok(ParenLeft),
                     new Reuse.ClassName(),
                     alt(tok(ParenRight), tok(ParenRightW)));

    let stru = seq(new Reuse.SimpleName(),
                   str("STRUCTURE"),
                   new Reuse.NamespaceSimpleName());

    let tables = seq(str("TABLES"), plus(altPrio(stru, new Reuse.FormParam())));
    let using = seq(str("USING"), plus(new Reuse.FormParam()));
    let changing = seq(str("CHANGING"), plus(new Reuse.FormParam()));
    let raising = seq(str("RAISING"), plus(alt(new Reuse.ClassName(), resume)));

    let ret = seq(str("FORM"),
                  new Reuse.FormName(),
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