import {Version} from "../../../version";
import {IStatement} from "./_statement";
import {seq, alt, altPrio, ver, regex as reg, optPrio} from "../combi";
import {MethodDefChanging, MethodDefReturning, Redefinition, MethodName, MethodDefExporting, MethodDefImporting, EventHandler, Abstract, MethodDefRaising, MethodDefExceptions, MethodParamName, NamespaceSimpleName, TypeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDef implements IStatement {

  public getMatcher(): IStatementRunnable {

    const def = ver(Version.v740sp08, seq("DEFAULT", altPrio("FAIL", "IGNORE")));

    const parameters = seq(optPrio(altPrio("FINAL", def, Abstract)),
                           optPrio(MethodDefImporting),
                           optPrio(MethodDefExporting),
                           optPrio(MethodDefChanging),
                           optPrio(MethodDefReturning),
                           optPrio(altPrio(MethodDefRaising, MethodDefExceptions)));

    const testing = seq(optPrio(Abstract), "FOR TESTING", optPrio(altPrio(MethodDefRaising, MethodDefExceptions)));

// todo, this is only from version something
    const tableFunction = seq("TABLE FUNCTION", reg(/^\w+?$/));
// todo, this is only from version something
    const ddl = "DDL OBJECT OPTIONS CDS SESSION CLIENT REQUIRED";

    const behavior = altPrio(
      seq("VALIDATE ON SAVE IMPORTING", MethodParamName, "FOR", TypeName),
      seq("MODIFY IMPORTING", MethodParamName, "FOR ACTION", TypeName, "RESULT", MethodParamName),
      seq("MODIFY IMPORTING", MethodParamName, "FOR CREATE", TypeName),
      seq("READ IMPORTING", MethodParamName, "FOR READ", TypeName, "RESULT", MethodParamName),
      seq("FEATURES IMPORTING", MethodParamName, "REQUEST", NamespaceSimpleName, "FOR", NamespaceSimpleName, "RESULT", MethodParamName),
      seq("DETERMINE ON MODIFY IMPORTING", MethodParamName, "FOR", TypeName),
      seq("DETERMINE ON SAVE IMPORTING", MethodParamName, "FOR", TypeName));

// todo, this is only from version something
    const amdp = seq(
      "AMDP OPTIONS CDS SESSION CLIENT CURRENT",
      optPrio(MethodDefImporting),
      optPrio(MethodDefExporting),
      optPrio(MethodDefRaising));

    const ret = seq(altPrio("CLASS-METHODS", "METHODS"),
                    MethodName,
                    alt(seq(optPrio(Abstract), EventHandler),
                        parameters,
                        testing,
                        seq("FOR", alt(tableFunction, ddl, behavior)),
                        amdp,
                        "NOT AT END OF MODE",
                        optPrio(Redefinition)));

    return ret;
  }

}