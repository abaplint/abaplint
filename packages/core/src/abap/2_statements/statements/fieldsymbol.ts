import {IStatement} from "./_statement";
import {seq, alt, opt, ver} from "../combi";
import {FieldSymbol as Name, Type, TypeTable, TypeName, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class FieldSymbol implements IStatement {

  public getMatcher(): IStatementRunnable {
    const stru = seq("STRUCTURE", TypeName, "DEFAULT", Field);

    const anyStructure = ver(Release.v916, seq("TYPE", "ANY", "STRUCTURE"));

    return seq("FIELD-SYMBOLS",
               Name,
               opt(alt(anyStructure, Type, TypeTable, stru)));
  }

}