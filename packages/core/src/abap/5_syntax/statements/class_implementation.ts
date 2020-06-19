import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectOriented} from "../_object_oriented";
import {ObjectReferenceType} from "../../types/basic";
import {Identifier} from "../../1_lexer/tokens";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {Position} from "../../../position";
import {BuiltIn} from "../_builtin";
import {ScopeType} from "../_scope_type";

export class ClassImplementation {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const helper = new ObjectOriented(scope);

    const className = helper.findClassName(node);
    scope.push(ScopeType.ClassImplementation, className, node.getFirstToken().getStart(), filename);

    const classDefinition = scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }
    const classAttributes = classDefinition.getAttributes();

    classDefinition.getTypeDefinitions().getAll().map((t) => scope.addType(t));

    const sup = classDefinition.getSuperClass();
    if (sup) {
      scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "super"), BuiltIn.filename, new ObjectReferenceType(sup)));
    }
    scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "me"), BuiltIn.filename, new ObjectReferenceType(className)));

    helper.addAliasedAttributes(classDefinition); // todo, this is not correct, take care of instance vs static

    scope.addList(classAttributes.getConstants());
    scope.addList(classAttributes.getInstance()); // todo, this is not correct, take care of instance vs static
    scope.addList(classAttributes.getStatic()); // todo, this is not correct, take care of instance vs static

    helper.fromSuperClass(classDefinition);
    helper.fromInterfaces(classDefinition);
  }
}