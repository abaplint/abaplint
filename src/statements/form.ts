import { Statement } from "./statement";
import { Token } from "../tokens/";
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

    let field = seq(fieldName, alt(Reuse.type(), Reuse.type_table()));

    let tables = seq(str("TABLES"), plus(field));
    let using = seq(str("USING"), plus(field));
    let changing = seq(str("CHANGING"), plus(field));
    let raising = seq(str("RAISING"), plus(Reuse.class_name()));

    let ret = seq(str("FORM"),
                  fieldName,
                  opt(tables),
                  opt(using),
                  opt(changing),
                  opt(raising));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Form(tokens);
    }
    return undefined;
  }

}