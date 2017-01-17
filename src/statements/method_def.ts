import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let seqs = Combi.seqs;
let alt = Combi.alt;
let opt = Combi.opt;
let tok = Combi.tok;
let reg = Combi.regex;
let plus = Combi.plus;
// let optPrio = Combi.optPrio;

export class MethodDef extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let field = reg(/^!?(\/\w+\/)?\w+$/);

    let importing  = seq(str("IMPORTING"),
                         plus(seq(new Reuse.MethodParam(), opt(str("OPTIONAL")))),
                         opt(seq(str("PREFERRED PARAMETER"), field)));

    let resumable = seq(str("RESUMABLE"),
                        tok(ParenLeft),
                        new Reuse.ClassName(),
                        alt(tok(ParenRight), tok(ParenRightW)));

    let exporting  = seq(str("EXPORTING"),  plus(new Reuse.MethodParam()));
    let changing   = seq(str("CHANGING"),   plus(seq(new Reuse.MethodParam(), opt(str("OPTIONAL")))));
    let returning  = seq(str("RETURNING"),  new Reuse.MethodParam());
    let raising    = seq(str("RAISING"),    plus(alt(resumable, new Reuse.ClassName())));
    let exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    let parameters = seqs(opt(alt(str("ABSTRACT"), str("FINAL"), str("FOR TESTING"))),
                          opt(importing),
                          opt(exporting),
                          opt(changing),
                          opt(returning),
                          opt(alt(raising, exceptions)));

    let event = seq(str("FOR EVENT"),
                    new Reuse.Field(),
                    str("OF"),
                    new Reuse.Field(),
                    opt(seq(str("IMPORTING"), plus(field))));

    let ret = seq(alt(str("CLASS-METHODS"), str("METHODS")),
                  new Reuse.Field(),
                  alt(event, parameters, seq(opt(str("FINAL")), str("REDEFINITION"))));

    return ret;
  }

}