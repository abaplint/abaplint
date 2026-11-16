import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode} from "../abap/nodes";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {CLikeType, CSequenceType, XSequenceType} from "../abap/types/basic";
import {EditHelper} from "../edit_helper";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";

export class InlineGenericSourceConf extends BasicRuleConfig {
}

interface IFixedType {
  /** name of the generic type, as the syntax check names it */
  generic: string;
  /** the type the inline declaration gets, as the syntax check names it */
  fixed: string;
  /** the same type, for CONV */
  conv: string;
}

export class InlineGenericSource implements IRule {
  private reg: IRegistry;
  private conf = new InlineGenericSourceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "inline_generic_source",
      title: "Inline declaration from a generically typed source",
      shortDescription: `Finds inline declarations whose value is a generically typed parameter or field symbol`,
      extendedInformation: `DATA( ) or FINAL( ) takes the type of the source. When the source is a parameter or
field symbol with a generic type, the type is fixed when the program is compiled: string for clike and
csequence, xstring for xsequence. The syntax check warns "The fixed type STRING is used for the generic
type CLIKE".

Reported for DATA(var) = source and FINAL(var) = source when the source is just the parameter or field
symbol. Most other generic types cannot be made concrete, that is a syntax error which check_syntax reports.

Declare the variable with a type, or name the type with CONV.

The pragma ##TYPE, which hides the syntax check warning, also hides this issue.

prefer_inline does not suggest inline declarations for generic sources, this rule reports the ones
that exist.

https://help.sap.com/doc/abapdocu_758_index_htm/7.58/en-US/abapmove.htm`,
      tags: [RuleTag.Quickfix],
      pragma: "##TYPE",
      badExample: `METHOD m. " IMPORTING iv TYPE clike
  DATA(lv) = iv.
ENDMETHOD.`,
      goodExample: `METHOD m. " IMPORTING iv TYPE clike
  DATA(lv) = CONV string( iv ).
ENDMETHOD.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: InlineGenericSourceConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

    const issues: Issue[] = [];
    for (const file of obj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        if (!(statement.get() instanceof Statements.Move)
            || statement.getPragmas().some(p => p.getStr().toUpperCase() === this.getMetadata().pragma)) {
          continue;
        }
        const inline = statement.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.InlineData);
        const name = inline?.findDirectExpression(Expressions.TargetField)?.getFirstToken();
        const operand = this.singleOperand(statement.findDirectExpression(Expressions.Source));
        if (name === undefined || operand === undefined) {
          continue;
        }

        const scope = syntax.spaghetti.lookupPosition(name.getStart(), file.getFilename());
        const resolved = scope?.getData().references.find(reference =>
          reference.referenceType === ReferenceType.DataReadReference
          && reference.position.getStart().equals(operand.getFirstToken().getStart()))?.resolved;
        if (!(resolved instanceof TypedIdentifier)) {
          continue;
        }

        const fixed = this.fixedType(resolved.getType());
        if (fixed === undefined) {
          continue;
        }

        const message = `The fixed type ${fixed.fixed} is used for the generic type ${fixed.generic} of "${operand.concatTokens()}", ` +
          `declare "${name.getStr()}" with a type or use CONV`;
        const replacement = `CONV ${fixed.conv}( ${operand.concatTokens()} )`;
        const fix = EditHelper.replaceRange(file, operand.getFirstToken().getStart(), operand.getLastToken().getEnd(), replacement);
        issues.push(Issue.atToken(file, name, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }

  /** The source when it is a single field or field symbol, without components, offset/length or dereference */
  private singleOperand(source: ExpressionNode | undefined): ExpressionNode | undefined {
    if (source === undefined || source.getChildren().length !== 1) {
      return undefined;
    }
    const chain = source.findDirectExpression(Expressions.FieldChain);
    if (chain === undefined || chain.getChildren().length !== 1) {
      return undefined;
    }
    const first = chain.getFirstChild();
    if (first instanceof ExpressionNode
        && (first.get() instanceof Expressions.SourceField || first.get() instanceof Expressions.SourceFieldSymbol)) {
      return chain;
    }
    return undefined;
  }

  /** The type the system uses for a generic type in an inline declaration, undefined if the type is not generic,
   *  or is a generic type that check_syntax does not make concrete */
  private fixedType(type: AbstractType): IFixedType | undefined {
    if (type instanceof CLikeType) {
      return {generic: "CLIKE", fixed: "STRING", conv: "string"};
    } else if (type instanceof CSequenceType) {
      return {generic: "CSEQUENCE", fixed: "STRING", conv: "string"};
    } else if (type instanceof XSequenceType) {
      return {generic: "XSEQUENCE", fixed: "XSTRING", conv: "xstring"};
    }
    return undefined;
  }

}
