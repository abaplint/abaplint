import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Class} from "../objects";
import {InfoClassDefinition} from "../abap/4_file_information/_abap_file_information";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPObject} from "../objects/_abap_object";
import {DDIC} from "../ddic";
import {EditHelper} from "../edit_helper";
import {StatementNode} from "../abap/nodes/statement_node";

export class FunctionalWritingConf extends BasicRuleConfig {
  /** Ignore functional writing in exception classes, local + global */
  public ignoreExceptions: boolean = true;
}

export class FunctionalWriting extends ABAPRule {

  private conf = new FunctionalWritingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "functional_writing",
      title: "Use functional writing",
      shortDescription: `Detects usage of call method when functional style calls can be used.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-functional-to-procedural-calls
https://docs.abapopenchecks.org/checks/07/`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix],
      badExample: `CALL METHOD zcl_class=>method( ).`,
      goodExample: `zcl_class=>method( ).`,
    };
  }

  private getMessage(): string {
    return "Use functional writing style for method calls.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FunctionalWritingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): readonly Issue[] {
    const issues: Issue[] = [];
    let exception = false;

    let definition: InfoClassDefinition | undefined = undefined;
    if (obj instanceof Class) {
      definition = obj.getClassDefinition();
    }

    const ddic = new DDIC(this.reg);

    for (const statNode of file.getStatements()) {
      if (statNode.get() instanceof Statements.ClassImplementation
        && definition
        && ddic.isException(definition, obj)
        && this.conf.ignoreExceptions) {
        exception = true;
      } else if (statNode.get() instanceof Statements.EndClass) {
        exception = false;
      } else if (exception === false && statNode.get() instanceof Statements.Call) {
        if (statNode.getFirstChild()?.get() instanceof Expressions.MethodCallChain) {
          continue;
        }

        const dynamic = statNode.findDirectExpression(Expressions.MethodSource)?.findDirectExpression(Expressions.Dynamic);
        if (dynamic !== undefined) {
          continue;
        }
        issues.push(this.createIssueForStatementNode(file, statNode));
      }
    }

    return issues;
  }

  private createIssueForStatementNode(file: ABAPFile, statNode: StatementNode): Issue {
    const fixString = this.buildFixString(statNode);
    const fix = EditHelper.replaceRange(file, statNode.getStart(), statNode.getEnd(), fixString);
    return Issue.atStatement(file, statNode, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
  }

  private buildFixString(statNode: StatementNode) {
    // Note: line breaks from source are lost
    const methodSource = statNode.findDirectExpression(Expressions.MethodSource);
    let methodSourceStr = methodSource?.concatTokens();
    const methodBody = statNode.findDirectExpression(Expressions.MethodCallBody);
    let methodBodyStr = "";
    if (methodBody) {
      const methodCallParam = methodBody.findDirectExpression(Expressions.MethodCallParam);
      if (methodCallParam && methodCallParam.getFirstToken().getStr() === "(") {
        // has parameters and parantheses
        methodBodyStr = `${methodBody.concatTokens()}.`;
      } else {
        // has parameters, but parentheses are missing
        methodSourceStr = `${methodSourceStr}( `;
        methodBodyStr = `${methodBody.concatTokens()} ).`;
      }
    }
    else {
      // no body means no parentheses and no parameters
      methodBodyStr = "( ).";
    }
    return methodSourceStr + methodBodyStr;
  }

}