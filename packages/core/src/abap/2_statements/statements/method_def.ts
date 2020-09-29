import {Version} from "../../../version";
import {IStatement} from "./_statement";
import {str, seq, alt, opt, ver, regex as reg, plus, optPrio} from "../combi";
import {MethodDefChanging, MethodDefReturning, Redefinition, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract, MethodDefRaising} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDef implements IStatement {

  public getMatcher(): IStatementRunnable {


    const exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    const def = ver(Version.v740sp08, seq(str("DEFAULT"), alt(str("FAIL"), str("IGNORE"))));

    const parameters = seq(opt(alt(new Abstract(), str("FINAL"), str("FOR TESTING"), def)),
                           opt(new MethodDefImporting()),
                           opt(new MethodDefExporting()),
                           opt(new MethodDefChanging()),
                           opt(new MethodDefReturning()),
                           opt(alt(new MethodDefRaising(), exceptions)));

// todo, this is only from version something
    const tableFunction = seq(str("FOR TABLE FUNCTION"), reg(/^\w+?$/));

    const ret = seq(alt(str("CLASS-METHODS"), str("METHODS")),
                    new MethodName(),
                    alt(seq(optPrio(new Abstract()), new EventHandler()),
                        parameters,
                        tableFunction,
                        str("NOT AT END OF MODE"),
                        opt(new Redefinition())));

    return ret;
  }

}