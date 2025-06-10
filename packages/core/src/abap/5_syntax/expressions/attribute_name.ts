import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {StructureType} from "../../types/basic/structure_type";
import {ObjectReferenceType} from "../../types/basic/object_reference_type";
import {ObjectOriented} from "../_object_oriented";
import {DataReference} from "../../types/basic/data_reference_type";
import {ReferenceType} from "../_reference";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {AnyType} from "../../types/basic";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class AttributeName {
  public static runSyntax(
    context: AbstractType | undefined,
    node: INode,
    input: SyntaxInput,
    type?: ReferenceType | ReferenceType[] | undefined,
    error = true): AbstractType | undefined {

    if (context instanceof VoidType) {
      return context;
    }

    const helper = new ObjectOriented(input.scope);

    let ret: AbstractType | undefined = undefined;

    if (context instanceof ObjectReferenceType) {
      const def = input.scope.findObjectDefinition(context.getIdentifierName());
      if (def === undefined) {
        const message = "Definition for \"" + context.getIdentifierName() + "\" not found in scope(AttributeName)";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
      const token = node.getFirstToken();
      const name = token.getStr();
      let found: TypedIdentifier | undefined = helper.searchAttributeName(def, name);
      if (found === undefined) {
        found = helper.searchConstantName(def, name);
      }
      if (found === undefined) {
        const message = "Attribute or constant \"" + name + "\" not found in \"" + def.getName() + "\"";
        if (error === true) {
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        }
        return VoidType.get(CheckSyntaxKey);
      }
      if (type) {
        input.scope.addReference(token, found, type, input.filename);
      }
      if (found && name.includes("~")) {
        const idef = input.scope.findInterfaceDefinition(name.split("~")[0]);
        if (idef) {
          input.scope.addReference(token, idef, ReferenceType.ObjectOrientedReference, input.filename);
        }
      }
      ret = found.getType();
    } else if (context instanceof DataReference) {
      const sub = context.getType();
      const name = node.getFirstToken().getStr();
      if (name === "*" || sub instanceof VoidType || sub instanceof AnyType) {
        return sub;
      }
      if (!(sub instanceof StructureType)) {
        const message = "Data reference not structured";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
      ret = sub.getComponentByName(name);
      if (ret === undefined) {
        const message = "Component \"" + name + "\" not found in data reference structure";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
    } else {
      const message = "Not an object reference, attribute name";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return VoidType.get(CheckSyntaxKey);
    }

    return ret;
  }

}