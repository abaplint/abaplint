import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {StatementNode} from "../abap/nodes";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {GenericObjectReferenceType, ObjectReferenceType, StructureType, VoidType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {Position} from "../position";
import {Dash, InstanceArrow, StaticArrow} from "../abap/1_lexer/tokens";

export class UseMessageClassConf extends BasicRuleConfig {
  /** Allow MESSAGE with an object reference, eg. an exception, like MESSAGE lx_error TYPE 'E' */
  public allowExceptions: boolean = true;
}

export class UseMessageClass extends ABAPRule {

  private conf = new UseMessageClassConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_message_class",
      title: "Use message class",
      shortDescription: `Define messages in SE91 instead of using inline text or variables`,
      extendedInformation: `If allowExceptions is enabled, MESSAGE with an object reference is allowed, eg. MESSAGE lx_error TYPE 'E'.

Void types are only allowed if the type name contains "CX_", as void class references cannot be distinguished from other void types.`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
      badExample: `MESSAGE 'Something went wrong' TYPE 'E'.`,
      goodExample: `MESSAGE e001(bc_msg).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseMessageClassConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): Issue[] {
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    const key = this.getMetadata().key;
    let syntax: ISyntaxResult | undefined = undefined;

    for (const statement of structure.findAllStatements(Statements.Message)) {
      // The parser populates MessageSource only for the class-based forms (e001(bc_msg) or ID/TYPE/NUMBER).
      // The text form (MESSAGE <source> TYPE <source>) uses MessageSourceSource directly with no MessageSource child.
      // Absence of MessageSource is therefore a reliable discriminator between the two forms.
      if (statement.findDirectExpression(Expressions.MessageSource) !== undefined) {
        continue;
      }

      if (this.conf.allowExceptions === true) {
        syntax ??= new SyntaxLogic(this.reg, obj).run();
        if (this.isObjectReference(statement, file, syntax)) {
          continue;
        }
      }

      issues.push(Issue.atStatement(file, statement, "Use a message class (SE91) instead of inline text or variable", key, this.conf.severity));
    }

    return issues;
  }

  private isObjectReference(statement: StatementNode, file: ABAPFile, syntax: ISyntaxResult): boolean {
    const chain = statement.findDirectExpression(Expressions.MessageSourceSource)
      ?.findDirectExpression(Expressions.Source)?.findDirectExpression(Expressions.FieldChain);
    if (chain === undefined) {
      return false;
    }

    let type = undefined as AbstractType | undefined;
    for (const child of chain.getChildren()) {
      const c = child.get();
      if (c instanceof Expressions.ComponentName) {
        type = type instanceof StructureType ? type.getComponentByName(child.concatTokens()) : undefined;
      } else if (c instanceof Expressions.SourceField
          || c instanceof Expressions.SourceFieldSymbol
          || c instanceof Expressions.AttributeName) {
        type = this.findType(child.getFirstToken().getStart(), file, syntax);
      } else if (c instanceof Expressions.ClassName
          || c instanceof InstanceArrow
          || c instanceof StaticArrow
          || c instanceof Dash) {
        continue;
      } else {
        return false;
      }
      if (type === undefined) {
        return false;
      }
    }

    // void class references cannot be distinguished from other void types, guess based on the name
    return type instanceof ObjectReferenceType
      || type instanceof GenericObjectReferenceType
      || (type instanceof VoidType && /CX_/i.test(type.getVoided() || ""));
  }

  private findType(start: Position, file: ABAPFile, syntax: ISyntaxResult): AbstractType | undefined {
    const scope = syntax.spaghetti.lookupPosition(start, file.getFilename());
    for (const r of scope?.getData().references || []) {
      if (r.position.getStart().equals(start) && r.resolved instanceof TypedIdentifier) {
        return r.resolved.getType();
      }
    }
    return undefined;
  }

}
