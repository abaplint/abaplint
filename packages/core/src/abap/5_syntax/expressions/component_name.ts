import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Basic from "../../types/basic";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class ComponentName {
  public runSyntax(context: AbstractType | undefined, node: INode, input: SyntaxInput): AbstractType | undefined {
    if (context instanceof Basic.VoidType) {
      return context;
    }

    const nameToken = node.getFirstToken();
    const name = nameToken.getStr();

    if (context instanceof Basic.StructureType) {
      const ret = context.getComponentByName(name);
      if (ret === undefined) {
        input.issues.push(syntaxIssue(input, nameToken, "Component \"" + name + "\" not found in structure"));
        return new Basic.VoidType(CheckSyntaxKey);
      }
      return ret;
    }

    if (context instanceof Basic.TableType && context.isWithHeader() === true) {
      const rowType = context.getRowType();
      if (rowType instanceof Basic.VoidType) {
        return context;
      } else if (name.toUpperCase() === "TABLE_LINE") {
        return rowType;
      } else if (rowType instanceof Basic.StructureType) {
        const ret = rowType.getComponentByName(name);
        if (ret === undefined) {
          input.issues.push(syntaxIssue(input, nameToken, "Component \"" + name + "\" not found in structure"));
          return new Basic.VoidType(CheckSyntaxKey);
        }
        return ret;
      }
    }

    input.issues.push(syntaxIssue(input, nameToken, "Not a structure, ComponentName, \"" + name + "\""));
    return new Basic.VoidType(CheckSyntaxKey);
  }

}