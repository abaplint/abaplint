import {Version} from "../../version";
import {Statement} from "./_statement";
import {str, seq, seqs, alt, opt, tok, ver, regex as reg, plus, IRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";
import {MethodParam, Field, ClassName} from "../expressions";

export class MethodDef extends Statement {

  public getMatcher(): IRunnable {
    let field = reg(/^!?(\/\w+\/)?\w+$/);

    let importing  = seq(str("IMPORTING"),
                         plus(seq(new MethodParam(), opt(str("OPTIONAL")))),
                         opt(seq(str("PREFERRED PARAMETER"), field)));

    let resumable = seq(str("RESUMABLE"),
                        tok(ParenLeft),
                        new ClassName(),
                        alt(tok(ParenRight), tok(ParenRightW)));

    let exporting  = seq(str("EXPORTING"),  plus(new MethodParam()));
    let changing   = seq(str("CHANGING"),   plus(seq(new MethodParam(), opt(str("OPTIONAL")))));
    let returning  = seq(str("RETURNING"),  new MethodParam());
    let raising    = seq(str("RAISING"),    plus(alt(resumable, new ClassName())));
    let exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    let def = ver(Version.v740sp08, seq(str("DEFAULT"), alt(str("FAIL"), str("IGNORE"))));

    let parameters = seqs(opt(alt(str("ABSTRACT"), str("FINAL"), str("FOR TESTING"), def)),
                          opt(importing),
                          opt(exporting),
                          opt(changing),
                          opt(returning),
                          opt(alt(raising, exceptions)));

    let event = seq(str("FOR EVENT"),
                    new Field(),
                    str("OF"),
                    new Field(),
                    opt(seq(str("IMPORTING"), plus(field))));

    let ret = seq(alt(str("CLASS-METHODS"), str("METHODS")),
                  new Field(),
                  alt(event, parameters, seq(opt(str("FINAL")), str("REDEFINITION"))));

    return ret;
  }

}