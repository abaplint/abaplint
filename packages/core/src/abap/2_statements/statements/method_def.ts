import {Version} from "../../../version";
import {IStatement} from "./_statement";
import {str, seq, alt, altPrio, ver, regex as reg, plus, optPrio} from "../combi";
import {MethodDefChanging, MethodDefReturning, Redefinition, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract, MethodDefRaising} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDef implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exceptions = seq(str("EXCEPTIONS"), plus(reg(/^\w+?$/)));

    const def = ver(Version.v740sp08, seq(str("DEFAULT"), altPrio(str("FAIL"), str("IGNORE"))));

    const parameters = seq(optPrio(altPrio(new Abstract(), str("FINAL"), str("FOR TESTING"), def)),
                           optPrio(new MethodDefImporting()),
                           optPrio(new MethodDefExporting()),
                           optPrio(new MethodDefChanging()),
                           optPrio(new MethodDefReturning()),
                           optPrio(alt(new MethodDefRaising(), exceptions)));

// todo, this is only from version something
    const tableFunction = seq(str("FOR TABLE FUNCTION"), reg(/^\w+?$/));

    const ret = seq(altPrio(str("CLASS-METHODS"), str("METHODS")),
                    new MethodName(),
                    alt(seq(optPrio(new Abstract()), new EventHandler()),
                        parameters,
                        tableFunction,
                        str("NOT AT END OF MODE"),
                        optPrio(new Redefinition())));

    return ret;
  }

}