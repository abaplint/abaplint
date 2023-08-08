import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DDIC} from "../ddic";
import {ABAPFile} from "../abap/abap_file";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ExpressionNode} from "../abap/nodes";
import {IRegistry} from "../_iregistry";
import {IMSAGReferences} from "../_imsag_references";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IObject} from "../objects/_iobject";
import {MessageClass} from "../objects";

export class MessageExistsConf extends BasicRuleConfig {
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
      for (const f of obj.getABAPFiles()) {
        issues.push(...this.runFile(f));
        issues.push(...this.checkSource2(f));
      }
    }
    return issues;
  }

////////////////////////////////

  private runFile(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    for (const statement of file.getStatements()) {
      const expressions = statement.findAllExpressionsMulti([Expressions.MessageClass, Expressions.MessageSource]);
      for (const node of expressions) {
        let issue: Issue | undefined = undefined;
        if (node.get() instanceof Expressions.MessageClass) {
          issue = this.checkClass(node, file);
        }

        if (issue) {
          issues.push(issue);
        }
      }
    }

// todo, check number of placeholders in message vs code matches

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

  private checkSource2(file: ABAPFile): Issue[] {
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
                const message = "Message class \"" + ref.token.getStr() + "\" not found";
                issues.push(Issue.atToken(file, ref.token, message, this.getMetadata().key, this.conf.severity));
              }
              continue;
            }

            const text = msag.getByNumber(ref.number);
            if (text === undefined) {
              const message = "Message number \"" + ref.number + "\" not found in class \"" + ref.messageClass + "\"";
              issues.push(Issue.atToken(file, ref.token, message, this.getMetadata().key, this.conf.severity));
            }
          }
        }
      }
    }

    return issues;
  }

}