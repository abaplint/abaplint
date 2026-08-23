import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {StructureNode, StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {IStructureComponent} from "../../types/basic";
import * as Basic from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {Type} from "../statements/type";
import {ScopeType} from "../_scope_type";
import {SyntaxInput} from "../_syntax_input";

export class TypeMesh {
  public runSyntax(node: StructureNode, input: SyntaxInput): TypedIdentifier | undefined {
    const begin = node.findDirectStatement(Statements.TypeMeshBegin);
    if (begin === undefined) {
      return undefined;
    }
    const name = begin.findFirstExpression(Expressions.NamespaceSimpleName)?.getFirstToken();
    if (name === undefined) {
      return undefined;
    }

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      if (!(c instanceof StatementNode)) {
        continue;
      }
      const ctyp = c.get();
      if (ctyp instanceof Statements.Type) {
        const found = new Type().runSyntax(c, input, name.getStr() + "-");
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (ctyp instanceof Statements.TypeMesh) {
        const found = this.runMeshNode(c, input);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      }
    }

    let qualifiedName = name.getStr();
    if (input.scope.getType() === ScopeType.ClassDefinition
        || input.scope.getType() === ScopeType.Interface) {
      qualifiedName = input.scope.getName() + "=>" + qualifiedName;
    }

    return new TypedIdentifier(name, input.filename, new Basic.StructureType(components, qualifiedName));
  }

////////////////////

  private runMeshNode(node: StatementNode, input: SyntaxInput): TypedIdentifier | undefined {
    const nameToken = node.findFirstExpression(Expressions.NamespaceSimpleName)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    const typeName = node.findFirstExpression(Expressions.TypeName);
    let type = new BasicTypes(input).resolveTypeName(typeName);
    if (type === undefined) {
      type = new Basic.UnknownType("Mesh node, unknown type " + typeName?.concatTokens());
    } else if (node.concatTokens().toUpperCase().includes(" TYPE REF TO ")) {
      type = new Basic.DataReference(type);
    }

    return new TypedIdentifier(nameToken, input.filename, type);
  }
}
