import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StructureNode, StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {IStructureComponent, VoidType} from "../../types/basic";
import {CurrentScope} from "../_current_scope";
import {IncludeType} from "../statements/include_type";
import {Type} from "../statements/type";
import * as Basic from "../../types/basic";
import {ScopeType} from "../_scope_type";

export class Types {
  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    const components: IStructureComponent[] = [];
    let voidd: VoidType | undefined = undefined;
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode) {
        if (ctyp instanceof Statements.Type) {
          const found = new Type().runSyntax(c, scope, filename);
          if (found) {
            components.push({name: found.getName(), type: found.getType()});
          }
        } else if (ctyp instanceof Statements.IncludeType) {
          const found = new IncludeType().runSyntax(c, scope, filename);
          if (found instanceof VoidType) {
            voidd = found;
          } else {
            components.push(...found);
          }
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Types) {
        const found = new Types().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      }
    }

    if (voidd) {
      return new TypedIdentifier(name, filename, voidd);
    } else if (components.length === 0) { // todo, remove this check
      return undefined;
    }

    let qualifiedName = name.getStr();
    if (scope.getType() === ScopeType.ClassDefinition
        || scope.getType() === ScopeType.Interface) {
      qualifiedName = scope.getName() + "=>" + qualifiedName;
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components, qualifiedName));
  }
}