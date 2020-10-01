import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StructureNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {IntegerType, IStructureComponent, StructureType} from "../../types/basic";
import {TypedIdentifier} from "../../types/_typed_identifier";

export class TypeEnum {
  public runSyntax(node: StructureNode, _scope: CurrentScope, filename: string): TypedIdentifier[] {
    if (!(node.get() instanceof Structures.TypeEnum)) {
      throw new Error("TypeEnum, unexpected type");
    }

    const begin = node.findDirectStatement(Statements.TypeEnumBegin);
    if (begin === undefined) {
      throw new Error("TypeEnum, unexpected type, begin");
    }

    let ret: TypedIdentifier[] = [];
    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      // integer is default if BASE TYPE is not specified
      ret.push(new TypedIdentifier(token, filename, new IntegerType()));
    }

    const stru = begin.findExpressionAfterToken("STRUCTURE");
    if (stru) {
      const components: IStructureComponent[] = [];
      for (const r of ret) {
        components.push({
          name: r.getName(),
          type: r.getType(),
        });
      }
      const id = new TypedIdentifier(stru.getFirstToken(), filename, new StructureType(components));
      ret = [id];
    }

    return ret;
  }
}