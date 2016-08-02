import { Statement } from "./statement";
import { Token } from "../tokens";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let tok = Combi.tok;
let reg = Combi.regex;
let plus = Combi.plus;

export class MethodDef extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let field = reg(/^!?\w+?$/);

    let type = alt(Reuse.type(), Reuse.type_table());

    let value = seq(str("VALUE"),
                    tok("ParenLeft"),
                    field,
                    tok("ParenRightW"));

    let fieldType = seq(field, type);
    let fieldsValue = seq(value, type);
    let fieldsOrValue = seq(alt(value, field), type);

    let importing  = seq(str("IMPORTING"),  plus(seq(fieldsOrValue, opt(str("OPTIONAL")))));
    let exporting  = seq(str("EXPORTING"),  plus(fieldType));
    let changing   = seq(str("CHANGING"),   plus(seq(fieldType, opt(str("OPTIONAL")))));
    let returning  = seq(str("RETURNING"),  plus(fieldsValue));
    let raising    = seq(str("RAISING"),    plus(Reuse.class_name()));
    let exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    let parameters = seq(opt(alt(str("ABSTRACT"), str("FOR TESTING"))),
                         opt(importing),
                         opt(exporting),
                         opt(changing),
                         opt(returning),
                         opt(alt(raising, exceptions)));

    let event = seq(str("FOR EVENT"),
                    Reuse.field(),
                    str("OF"),
                    Reuse.field(),
                    opt(seq(str("IMPORTING"), plus(field))));

    let ret = seq(alt(str("CLASS-METHODS"), str("METHODS")),
                  Reuse.field(),
                  alt(event, parameters, str("REDEFINITION")));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new MethodDef(tokens);
    }
    return undefined;
  }

}