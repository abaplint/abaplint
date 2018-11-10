import {Version} from "../../version";
import {Statement} from "./_statement";
import {str, seq, alt, opt, tok, ver, regex as reg, plus, IRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";
import {Field, ClassName, MethodName, MethodDefExporting, MethodDefImporting, MethodDefChanging, MethodDefReturning} from "../expressions";

export class MethodDef extends Statement {

  public getMatcher(): IRunnable {
    let field = reg(/^!?(\/\w+\/)?\w+$/);

    let resumable = seq(str("RESUMABLE"),
                        tok(ParenLeft),
                        new ClassName(),
                        alt(tok(ParenRight), tok(ParenRightW)));

    let raising    = seq(str("RAISING"),    plus(alt(resumable, new ClassName())));
    let exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    let def = ver(Version.v740sp08, seq(str("DEFAULT"), alt(str("FAIL"), str("IGNORE"))));

    let parameters = seq(opt(alt(str("ABSTRACT"), str("FINAL"), str("FOR TESTING"), def)),
                         opt(new MethodDefImporting()),
                         opt(new MethodDefExporting()),
                         opt(new MethodDefChanging()),
                         opt(new MethodDefReturning()),
                         opt(alt(raising, exceptions)));

    let event = seq(str("FOR EVENT"),
                    new Field(),
                    str("OF"),
                    new Field(),
                    opt(seq(str("IMPORTING"), plus(field))));

    let ret = seq(alt(str("CLASS-METHODS"), str("METHODS")),
                  new MethodName(),
                  alt(event, parameters,
                      str("NOT AT END OF MODE"),
                      seq(opt(str("FINAL")), str("REDEFINITION"))));

    return ret;
  }

}