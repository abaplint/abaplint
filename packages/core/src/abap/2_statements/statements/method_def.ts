import {Version} from "../../../version";
import {IStatement} from "./_statement";
import {seq, alt, altPrio, ver, regex as reg, plusPrio, optPrio} from "../combi";
import {MethodDefChanging, MethodDefReturning, Redefinition, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract, MethodDefRaising, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDef implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exceptions = seq("EXCEPTIONS", plusPrio(NamespaceSimpleName));

    const def = ver(Version.v740sp08, seq("DEFAULT", altPrio("FAIL", "IGNORE")));

    const parameters = seq(optPrio(altPrio(seq(Abstract, optPrio("FOR TESTING")), "FINAL", "FOR TESTING", def)),
                           optPrio(MethodDefImporting),
                           optPrio(MethodDefExporting),
                           optPrio(MethodDefChanging),
                           optPrio(MethodDefReturning),
                           optPrio(alt(MethodDefRaising, exceptions)));

// todo, this is only from version something
    const tableFunction = seq("FOR TABLE FUNCTION", reg(/^\w+?$/));
// todo, this is only from version something
    const ddl = "FOR DDL OBJECT OPTIONS CDS SESSION CLIENT REQUIRED";
// todo, this is only from version something
    const amdp = "AMDP OPTIONS CDS SESSION CLIENT current";

    const ret = seq(altPrio("CLASS-METHODS", "METHODS"),
                    MethodName,
                    alt(seq(optPrio(Abstract), EventHandler),
                        parameters,
                        tableFunction,
                        ddl,
                        amdp,
                        "NOT AT END OF MODE",
                        optPrio(Redefinition)));

    return ret;
  }

}