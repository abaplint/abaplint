import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import {StructureNode, StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {IStructureComponent} from "../../types/basic";
import {CurrentScope} from "../../syntax/_current_scope";
import {IncludeType} from "../../syntax/statements/include_type";
import {Type} from "../../syntax/statements/type";
import * as Basic from "../../types/basic";

export class Types {
  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    let components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Type) {
        const found = new Type().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.IncludeType) {
        components = components.concat(new IncludeType().runSyntax(c, scope, filename));
      }
      // todo, nested structures
    }

    if (components.length === 0) { // todo, remove this check
      return undefined;
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components));
  }
}