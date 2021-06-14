import {INode} from "../../nodes/_inode";
import {AbstractType} from "../../types/basic/_abstract_type";
import {VoidType} from "../../types/basic/void_type";
import {ObjectReferenceType} from "../../types/basic/object_reference_type";
import {ObjectOriented} from "../_object_oriented";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {AttributeName} from "../../2_statements/expressions";

export class AttributeChain {
  public runSyntax(
    inputContext: AbstractType | undefined,
    node: INode,
    scope: CurrentScope,
    filename: string,
    type?: ReferenceType | undefined): AbstractType | undefined {

    if (inputContext instanceof VoidType) {
      return inputContext;
    } else if (!(inputContext instanceof ObjectReferenceType)) {
      throw new Error("Not a object reference(AttributeChain)");
    }

    const children = node.getChildren().slice();
    const first = children[0];
    if (!(first.get() instanceof AttributeName)) {
      throw new Error("AttributeChain, unexpected first child");
    }

    const def = scope.findClassDefinition(inputContext.getIdentifierName());
    if (def === undefined) {
      throw new Error("Definition for \"" + inputContext.getIdentifierName() + "\" not found in scope");
    }
    const nameToken = first.getFirstToken();
    const name = nameToken.getStr();
    const helper = new ObjectOriented(scope);

    let context: TypedIdentifier | undefined = helper.searchAttributeName(def, name);
    if (context === undefined) {
      context = helper.searchConstantName(def, name);
    }
    if (context === undefined) {
      throw new Error("Attribute or constant \"" + name + "\" not found in \"" + def.getName() + "\"");
    }
    scope.addReference(nameToken, context, type, filename);


// todo, loop, handle ArrowOrDash, ComponentName, TableExpression

    return context.getType();
  }

}