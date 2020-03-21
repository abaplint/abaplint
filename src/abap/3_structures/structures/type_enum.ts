import * as Statements from "../../2_statements/statements";
import * as Expressions from "../../2_statements/expressions";
import {IStructure} from "./_structure";
import {star, sta, alt, beginEnd} from "./_combi";
import {StructureNode} from "../../nodes";
import {CurrentScope} from "../../syntax/_current_scope";
import {UnknownType} from "../../types/basic";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {IStructureRunnable} from "./_structure_runnable";

export class TypeEnum implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeEnumBegin),
                    star(alt(sta(Statements.TypeEnum), sta(Statements.Type))),
                    sta(Statements.TypeEnumEnd));
  }

  public runSyntax(node: StructureNode, _scope: CurrentScope, filename: string): TypedIdentifier[] {
    if (!(node.get() instanceof TypeEnum)) {
      throw new Error("addEnumValues unexpected type");
    }
    const ret: TypedIdentifier[] = [];
    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      ret.push(new TypedIdentifier(token, filename, new UnknownType("todo, type_enum")));
    }
    return ret;
  }

}