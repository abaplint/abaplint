import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let tok = Combi.tok;
let altPrio = Combi.altPrio;
let plus = Combi.plus;

export class Form extends Statement {

  public static get_matcher(): Combi.IRunnable {

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