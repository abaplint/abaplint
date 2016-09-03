import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let reg = Combi.regex;
let plus = Combi.plus;

export class Form extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let fieldName = reg(/^\w+$/);

    let field = seq(fieldName, opt(alt(Reuse.type(), Reuse.type_table())));

    let tables = seq(str("TABLES"), plus(field));
    let using = seq(str("USING"), plus(field));
    let changing = seq(str("CHANGING"), plus(field));
    let raising = seq(str("RAISING"), plus(Reuse.class_name()));

    let ret = seq(str("FORM"),
                  Reuse.form_name(),
                  opt(tables),
                  opt(using),
                  opt(changing),
                  opt(raising));

    return ret;
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}