import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Basic from "../../types/basic";
import {CheckSyntaxKey, SyntaxInput} from "../_syntax_input";
import {Issue} from "../../../issue";
import {Severity} from "../../../severity";

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
        const message = "Component \"" + name + "\" not found in structure";
        input.issues.push(Issue.atTokenFilename(input.filename, nameToken, message, CheckSyntaxKey, Severity.Error));
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
          throw new Error("Component \"" + name + "\" not found in structure");
        }
        return ret;
      }
    }

    throw new Error("Not a structure, ComponentName, \"" + name + "\"");
  }

}