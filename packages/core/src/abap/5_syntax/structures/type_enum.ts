import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StructureNode} from "../../nodes";
import {IntegerType, IStructureComponent, StructureType} from "../../types/basic";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {ReferenceType} from "../_reference";
import {EnumType} from "../../types/basic/enum_type";
import {ScopeType} from "../_scope_type";
import {SyntaxInput} from "../_syntax_input";

export class TypeEnum {
  public runSyntax(node: StructureNode, input: SyntaxInput): {values: TypedIdentifier[], types: TypedIdentifier[]} {
    let values: TypedIdentifier[] = [];
    const types: TypedIdentifier[] = [];

    if (!(node.get() instanceof Structures.TypeEnum)) {
      throw new Error("TypeEnum, unexpected type");
    }

    const begin = node.findDirectStatement(Statements.TypeEnumBegin);
    if (begin === undefined) {
      throw new Error("TypeEnum, unexpected type, begin");
    }

    for (const type of node.findDirectStatements(Statements.Type)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      // integer is default if BASE TYPE is not specified
      values.push(new TypedIdentifier(token, input.filename, IntegerType.get()));
    }
    for (const type of node.findDirectStatements(Statements.TypeEnum)) {
      const expr = type.findFirstExpression(Expressions.NamespaceSimpleName);
      if (expr === undefined) {
        continue;
      }
      const token = expr.getFirstToken();
      // integer is default if BASE TYPE is not specified
      values.push(new TypedIdentifier(token, input.filename, IntegerType.get()));
    }

    const baseType = begin.findExpressionAfterToken("TYPE")?.getFirstToken();
    const baseName = baseType?.getStr();
    if (baseType && baseName) {
      const found = input.scope.findType(baseName);
      if (found) {
        input.scope.addReference(baseType, found, ReferenceType.TypeReference, input.filename);
      }
    }

    const name = begin.findFirstExpression(Expressions.NamespaceSimpleName);
    if (name) {
      let qualifiedName = name.concatTokens();
      if (input.scope.getType() === ScopeType.ClassDefinition
          || input.scope.getType() === ScopeType.Interface) {
        qualifiedName = input.scope.getName() + "=>" + qualifiedName;
      }
      const etype = new EnumType({qualifiedName: qualifiedName});
      const id = new TypedIdentifier(name.getFirstToken(), input.filename, etype, [IdentifierMeta.Enum]);
      input.scope.addType(id);
      types.push(id);
    }

    const stru = begin.findExpressionAfterToken("STRUCTURE");
    if (stru) {
      const components: IStructureComponent[] = [];
      for (const r of values) {
        components.push({
          name: r.getName(),
          type: r.getType(),
        });
      }
      values = [];
      const id = new TypedIdentifier(stru.getFirstToken(), input.filename, new StructureType(components), [IdentifierMeta.Enum]);
      values.push(id);
    }

    return {values, types};
  }
}