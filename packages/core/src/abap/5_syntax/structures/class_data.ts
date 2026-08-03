import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StructureNode, StatementNode} from "../../nodes";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {IStructureComponent} from "../../types/basic";
import * as Basic from "../../types/basic";
import {ClassData as ClassDataSyntax} from "../statements/class_data";
import {SyntaxInput} from "../_syntax_input";

export class ClassData {
  public runSyntax(node: StructureNode, input: SyntaxInput): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();
    const values: any = {};

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.ClassData) {
        const found = new ClassDataSyntax().runSyntax(c, input);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
          values[found.getName()] = found.getValue() as string;
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.ClassData) {
        const found = new ClassData().runSyntax(c, input);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
          values[found.getName()] = found.getValue();
        }
      }
      // todo, INCLUDES
    }

    return new TypedIdentifier(name, input.filename, new Basic.StructureType(components), [IdentifierMeta.Static], values);
  }
}
