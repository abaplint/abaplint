import {IStatement} from "./_statement";
import {seq, alt, per, opt, ver, altPrio, plus} from "../combi";
import * as Expressions from "../expressions";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {lobHandleType, lobKind, lobColumns} from "../expressions/_lob_handle_type";

export class Type implements IStatement {

  public getMatcher(): IStatementRunnable {
    const simple = per(Expressions.Type, Expressions.Decimals, Expressions.Length);

    const clientSpecified = ver(Release.v760, seq("TYPE", Expressions.TypeName, "CLIENT", "SPECIFIED",
                                                  Expressions.FieldChain,
                                                  opt(plus(seq(lobKind(), lobColumns())))));

    const anyStructure = ver(Release.v916, seq("TYPE", "ANY", "STRUCTURE",
                                               opt(seq("CONTAINING",
                                                       plus(seq(Expressions.DefinitionName, "TYPE", Expressions.TypeSimpleRef))))));

    const def = seq(Expressions.NamespaceSimpleName,
                    opt(Expressions.ConstantFieldLength),
                    opt(altPrio(ver(Release.v731, lobHandleType()), clientSpecified, anyStructure,
                                alt(simple, Expressions.TypeTable, Expressions.TypeStructure))));

// todo, BOXED is only allowed with structures inside structures?
    const boxed = ver(Release.v702, "BOXED");

    const ret = seq("TYPES", def, opt(boxed));

    return ret;
  }

}