import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let reg = Combi.regex;
let plus = Combi.plus;

export class MethodDef extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let field = reg(/^!?(\/\w+\/)?\w+$/);

    let type = alt(Reuse.type(), Reuse.type_table());

    let fieldType = seq(field, type);
    let fieldsValue = seq(Reuse.pass_by_value(), type);
    let fieldsOrValue = seq(alt(Reuse.pass_by_value(), field), type);

    let importing  = seq(str("IMPORTING"),
                         plus(seq(fieldsOrValue, opt(str("OPTIONAL")))),
                         opt(seq(str("PREFERRED PARAMETER"), field)));

    let exporting  = seq(str("EXPORTING"),  plus(fieldsOrValue));
    let changing   = seq(str("CHANGING"),   plus(seq(fieldType, opt(str("OPTIONAL")))));
    let returning  = seq(str("RETURNING"),  plus(fieldsValue));
    let raising    = seq(str("RAISING"),    plus(Reuse.class_name()));
    let exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    let parameters = seq(opt(alt(str("ABSTRACT"), str("FINAL"), str("FOR TESTING"))),
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

}