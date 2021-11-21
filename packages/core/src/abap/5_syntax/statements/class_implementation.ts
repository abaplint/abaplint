import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ObjectOriented} from "../_object_oriented";
import {ObjectReferenceType} from "../../types/basic";
import {Identifier} from "../../1_lexer/tokens";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {Position} from "../../../position";
import {BuiltIn} from "../_builtin";
import {ScopeType} from "../_scope_type";
import {StatementSyntax} from "../_statement_syntax";

export class ClassImplementation implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const helper = new ObjectOriented(scope);

    const className = helper.findClassName(node);
    scope.push(ScopeType.ClassImplementation, className, node.getFirstToken().getStart(), filename);

    const classDefinition = scope.findClassDefinition(className);
    if (classDefinition === undefined) {
      throw new Error("Class definition for \"" + className + "\" not found");
    }

    for (const t of classDefinition.getTypeDefinitions().getAll()) {
      scope.addType(t.type);
    }

    const sup = scope.findClassDefinition(classDefinition.getSuperClass());
    if (sup) {
      scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "super"), BuiltIn.filename, new ObjectReferenceType(sup)));
    }
    scope.addIdentifier(new TypedIdentifier(new Identifier(new Position(1, 1), "me"), BuiltIn.filename, new ObjectReferenceType(classDefinition)));
    helper.addAliasedAttributes(classDefinition); // todo, this is not correct, take care of instance vs static

    const classAttributes = classDefinition.getAttributes();
    scope.addList(classAttributes.getConstants());
    scope.addList(classAttributes.getStatic());
    for (const i of classAttributes.getInstance()) {
      scope.addExtraLikeType(i);
    }

    helper.fromSuperClassesAndInterfaces(classDefinition);
  }
}