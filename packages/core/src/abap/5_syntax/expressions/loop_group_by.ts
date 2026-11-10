import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {DataReference, IntegerType, StructureType, VoidType} from "../../types/basic";
import {IStructureComponent} from "../../types/basic/structure_type";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {ReferenceType} from "../_reference";
import {InlineData} from "./inline_data";
import {FSTarget} from "./fstarget";
import {Target} from "./target";
import {SyntaxInput} from "../_syntax_input";
import {Source} from "./source";
import {FieldChain} from "./field_chain";

export class LoopGroupBy {
  /**
   * @param rowType row type of the grouped table, the type of the members of each group
   * @param representative the row target of the LOOP, it is the group when GROUP BY has no target
   */
  public static runSyntax(node: ExpressionNode, input: SyntaxInput,
                          rowType: AbstractType | undefined, representative: ExpressionNode | undefined): void {

    const keyType = this.runKey(node, input);

    const groupTarget = node.findDirectExpression(Expressions.LoopGroupByTarget);
    const target = groupTarget?.findDirectExpression(Expressions.Target);
    const fsTarget = groupTarget?.findDirectExpression(Expressions.FSTarget);

    if (target) {
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        const isReference = groupTarget?.findDirectTokenByText("REFERENCE") !== undefined;
        InlineData.runSyntax(inline, input, isReference ? new DataReference(keyType) : keyType);
      } else {
        Target.runSyntax(target, input);
      }
    } else if (fsTarget) {
      FSTarget.runSyntax(fsTarget, input, keyType);
    }

    if (rowType) {
      const group = this.findTargetIdentifier(target ?? fsTarget ?? representative, input);
      if (group) {
        input.scope.setGroupMemberType(group, rowType);
      }
    }
  }

  /** type of the group key, from GROUP BY expr or GROUP BY ( name = expr ... ) */
  public static runKey(node: ExpressionNode | StatementNode, input: SyntaxInput): AbstractType {
    const components = node.findDirectExpressions(Expressions.LoopGroupByComponent);
    if (components.length === 0) {
      // LOOP: the key is the first child of LoopGroupBy, FOR GROUPS: the key follows GROUP BY
      const key = node.get() instanceof Expressions.LoopGroupBy ? node.getFirstChild() : node.findExpressionAfterToken("BY");
      let type: AbstractType | undefined = undefined;
      if (key instanceof ExpressionNode && key.get() instanceof Expressions.Source) {
        type = Source.runSyntax(key, input);
      } else if (key instanceof ExpressionNode && key.get() instanceof Expressions.FieldChain) {
        type = FieldChain.runSyntax(key, input, ReferenceType.DataReadReference);
      }
      return type ?? VoidType.get("GroupKey");
    }

    const fields: IStructureComponent[] = [];
    let dynamic = false;
    for (const c of components) {
      const single = c.findDirectExpression(Expressions.ComponentCompareSingle);
      if (single) {
        const source = single.findDirectExpression(Expressions.Source);
        const type = source ? Source.runSyntax(source, input) : undefined;
        const name = single.findDirectExpression(Expressions.ComponentChainSimple);
        if (name === undefined) {
          dynamic = true;
          continue;
        }
        fields.push({name: name.concatTokens(), type: type ?? VoidType.get("GroupKey")});
      } else {
        // GROUP SIZE and GROUP INDEX
        const name = c.findDirectExpression(Expressions.ComponentName);
        if (name) {
          fields.push({name: name.concatTokens(), type: IntegerType.get()});
        }
      }
    }

    if (dynamic === true || fields.length === 0) {
      return VoidType.get("GroupKey");
    }
    return new StructureType(fields);
  }

  /** the group variable in LOOP AT GROUP group and FOR ... IN GROUP group */
  public static findMemberType(source: ExpressionNode | undefined, input: SyntaxInput): AbstractType | undefined {
    if (source === undefined) {
      return undefined;
    }
    const name = source.concatTokens().replace(/\s/g, "").replace(/->\*$/, "");
    const found = input.scope.findVariable(name);
    return found ? input.scope.findGroupMemberType(found) : undefined;
  }

  private static findTargetIdentifier(node: ExpressionNode | undefined, input: SyntaxInput): TypedIdentifier | undefined {
    if (node === undefined) {
      return undefined;
    }
    const inline = node.findDirectExpression(Expressions.InlineData) ?? node.findDirectExpression(Expressions.InlineFS);
    let name: string | undefined;
    if (inline) {
      name = (inline.findFirstExpression(Expressions.TargetField)
        ?? inline.findFirstExpression(Expressions.TargetFieldSymbol))?.getFirstToken().getStr();
    } else if (node.getChildren().length === 1) {
      name = node.getFirstToken().getStr();
    }
    return input.scope.findVariable(name);
  }
}
