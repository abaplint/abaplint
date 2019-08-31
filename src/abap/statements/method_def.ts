import {Version} from "../../version";
import {Statement} from "./_statement";
import {str, seq, alt, opt, tok, ver, regex as reg, plus, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {ClassName, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract} from "../expressions";
import {MethodDefChanging, MethodDefReturning, Redefinition} from "../expressions";

export class MethodDef extends Statement {

  public getMatcher(): IStatementRunnable {
    const resumable = seq(str("RESUMABLE"),
                          tok(ParenLeft),
                          new ClassName(),
                          tok(ParenRightW));

    const raising = seq(str("RAISING"), plus(alt(resumable, new ClassName())));

    const exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    const def = ver(Version.v740sp08, seq(str("DEFAULT"), alt(str("FAIL"), str("IGNORE"))));

    const parameters = seq(opt(alt(new Abstract(), str("FINAL"), str("FOR TESTING"), def)),
                           opt(new MethodDefImporting()),
                           opt(new MethodDefExporting()),
                           opt(new MethodDefChanging()),
                           opt(new MethodDefReturning()),
                           opt(alt(raising, exceptions)));

    const ret = seq(alt(str("CLASS-METHODS"), str("METHODS")),
                    new MethodName(),
                    alt(new EventHandler(), parameters,
                        str("NOT AT END OF MODE"),
                        opt(new Redefinition())));

    return ret;
  }

}