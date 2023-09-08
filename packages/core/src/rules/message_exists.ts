import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DDIC} from "../ddic";
import {ABAPFile} from "../abap/abap_file";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {IRegistry} from "../_iregistry";
import {IMSAGReferences} from "../_imsag_references";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IObject} from "../objects/_iobject";
import {MessageClass} from "../objects";

export class MessageExistsConf extends BasicRuleConfig {
  public checkPlaceholders = true;
}

export class MessageExistsRule implements IRule {
  private conf = new MessageExistsConf();
  // @ts-ignore
  private msagReferences: IMSAGReferences;
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "message_exists",
      title: "Check MESSAGE exists",
      shortDescription: `In message statements, check that the message class + id exist`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MessageExistsConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.msagReferences = reg.getMSAGReferences();
    this.reg = reg;

    // the SyntaxLogic builds the references
    for (const obj of reg.getObjects()) {
      if (obj instanceof ABAPObject) {
        new SyntaxLogic(reg, obj).run();
      }
    }

    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const issues: Issue[] = [];
    if (obj instanceof ABAPObject) {
      for (const file of obj.getABAPFiles()) {
        const struc = file.getStructure();
        if (struc === undefined) {
          return [];
        }

        issues.push(...this.checkReportStatement(file));
        issues.push(...this.checkSource(file));
      }
    }
    return issues;
  }

////////////////////////////////

  private checkReportStatement(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Statements.Report)) {
        continue;
      }
      const expression = statement.findFirstExpression(Expressions.MessageClass);
      if (expression) {
        const issue = this.checkClass(expression, file);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  private checkClass(node: ExpressionNode, file: ABAPFile): Issue | undefined {
    const token = node.getFirstToken();
    const name = token.getStr();
    if (this.reg.getObject("MSAG", name) === undefined
        && new DDIC(this.reg).inErrorNamespace(name) === true) {
      const message = "Message class \"" + name + "\" not found";
      return Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
    }
    return undefined;
  }

  private checkSource(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const references = this.msagReferences.listByFilename(file.getFilename());

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Raise || statement.get() instanceof Statements.Message) {
        for (const ref of references) {
          // always max one message reference per statement? chained statements?
          if (ref.token.getStart().isBetween(statement.getStart(), statement.getEnd())) {
            const msag = this.reg.getObject("MSAG", ref.messageClass) as MessageClass | undefined;
            if (msag === undefined) {
              if (new DDIC(this.reg).inErrorNamespace(ref.messageClass) === true) {
                const message = "Message class \"" + ref.messageClass + "\" not found";
                issues.push(Issue.atToken(file, ref.token, message, this.getMetadata().key, this.conf.severity));
              }
              continue;
            }

            const text = msag.getByNumber(ref.number);
            if (text === undefined) {
              const message = "Message number \"" + ref.number + "\" not found in class \"" + ref.messageClass + "\"";
              issues.push(Issue.atToken(file, ref.token, message, this.getMetadata().key, this.conf.severity));
              continue;
            }

            if (this.getConfig().checkPlaceholders === true) {
              const count = this.countWith(statement);
              const textCount = text.getPlaceholderCount();
              if (count !== textCount) {
                const message = `Message ${ref.number}, expected ${textCount} WITH parameters`;
                issues.push(Issue.atToken(file, ref.token, message, this.getMetadata().key, this.conf.severity));
              }
            }
          }
        }
      }
    }

    return issues;
  }

  private countWith(statement: StatementNode): number {
    const raiseWith = statement.findDirectExpression(Expressions.RaiseWith);
    if (raiseWith) {
      return raiseWith.getChildren().length - 1;
    }

    let count = 0;
    let afterWith = false;
    for (const expression of statement.getChildren()) {
      if (expression instanceof TokenNode && expression.concatTokens().toUpperCase() === "WITH") {
        afterWith = true;
        continue;
      }
      if (afterWith === true) {
        if (expression instanceof ExpressionNode) {
          count++;
        } else {
          break;
        }
      }
    }

    return count;
  }

}