import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StructureNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {IStructureComponent} from "../../types/basic";
import * as Basic from "../../types/basic";
import {Constant} from "../statements/constant";

export class Constants {
  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): {type: TypedIdentifier | undefined, values: object} {
    const name = node.findFirstExpression(Expressions.DefinitionName)?.getFirstToken();
    if (name === undefined) {
      throw new Error("Constants, structure, unexpected node");
    }

    const components: IStructureComponent[] = [];
    const values: any = {};
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Constant) {
        const found = new Constant().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
          values[found.getName()] = found.getValue();
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Constants) {
        const {type: found, values: val} = new Constants().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
          values[found.getName()] = val;
        }
      }
    }

    if (components.length === 0) {
      return {type: undefined, values};
    }

    const type = new TypedIdentifier(name, filename, new Basic.StructureType(components), [IdentifierMeta.ReadOnly, IdentifierMeta.Static]);
    return {type, values};
  }
}