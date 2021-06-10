import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StructureNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {IntegerType, IStructureComponent, StructureType} from "../../types/basic";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {ReferenceType} from "../_reference";
import {EnumType} from "../../types/basic/enum_type";

export class TypeEnum {
  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier[] {
    if (!(node.get() instanceof Structures.TypeEnum)) {
      throw new Error("TypeEnum, unexpected type");
    }

    const begin = node.findDirectStatement(Statements.TypeEnumBegin);
    if (begin === undefined) {
      throw new Error("TypeEnum, unexpected type, begin");
    }

    const ret: TypedIdentifier[] = [];
    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      // integer is default if BASE TYPE is not specified
      ret.push(new TypedIdentifier(token, filename, new IntegerType()));
    }
    for (const type of node.findDirectStatements(Statements.TypeEnum)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      // integer is default if BASE TYPE is not specified
      ret.push(new TypedIdentifier(token, filename, new IntegerType()));
    }

    const baseType = begin.findExpressionAfterToken("TYPE")?.getFirstToken();
    const baseName = baseType?.getStr();
    if (baseType && baseName) {
      const found = scope.findType(baseName);
      if (found) {
        scope.addReference(baseType, found, ReferenceType.TypeReference, filename);
      }
    }

    const name = begin.findFirstExpression(Expressions.NamespaceSimpleName);
    if (name) {
      const id = new TypedIdentifier(name.getFirstToken(), filename, new EnumType(), [IdentifierMeta.Enum]);
      scope.addType(id);
      ret.push(id);
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
      const id = new TypedIdentifier(stru.getFirstToken(), filename, new StructureType(components), [IdentifierMeta.Enum]);
      scope.addType(id);
      ret.push(id);
    }

    return ret;
  }
}