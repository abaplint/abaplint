import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode, StructureNode} from "../abap/nodes";
import {IRegistry} from "../_iregistry";
import {Class, Program} from "../objects";
import {DDIC} from "../ddic";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {MethodDefinition} from "../abap/types";

export class UncaughtExceptionConf extends BasicRuleConfig {
}

export class UncaughtException extends ABAPRule {

  private conf = new UncaughtExceptionConf();

  private globalExceptions: {[index: string]: string | undefined};
  private localExceptions: {[index: string]: string | undefined};
  private issues: Issue[] = [];
  private sinked: string[] | undefined;
  private syntax: ISyntaxResult;

  public getMetadata(): IRuleMetadata {
    return {
      key: "uncaught_exception",
      title: "Uncaught Exception",
      shortDescription: `Checks for uncaught static exception`,
      extendedInformation: `Does not report any issues if the code contains syntax errors`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    super.initialize(reg);
    this.findGlobalExceptions();
    return this;
  }

  public setConfig(conf: UncaughtExceptionConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    if (obj.getType() === "INTF") { // nothing can be raised in interfaces
      return [];
    } if (obj instanceof Program && obj.isInclude() === true) {
      return [];
    }

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    this.findLocalExceptions(obj);

    this.syntax = new SyntaxLogic(this.reg, obj).run();
    if (this.syntax.issues.length > 0) {
      return [];
    }

    this.issues = [];
    this.sinked = undefined;
    for (const c of stru.getChildren()) {
      this.traverse(c, file);
    }

    return this.issues;
  }

  private traverse(n: StructureNode | StatementNode, file: ABAPFile) {
    const get = n.get();
    if (get instanceof Structures.ClassDefinition
        || get instanceof Structures.Interface) {
      return; // to optimize performance
    }

    if (n instanceof StructureNode) {
      if (get instanceof Structures.Try) {
        // note that TRY-CATCH might be arbitrarily nested
        const previous = this.sinked ? this.sinked.slice() : undefined;
        this.addFromTryStructure(n);
        for (const c of n.getChildren()) {
          this.traverse(c, file);
        }
        this.sinked = previous;
        return;
      } else {
        for (const c of n.getChildren()) {
          this.traverse(c, file);
        }
      }
    } else if (n instanceof StatementNode) {
      if (get instanceof Statements.MethodImplementation) {
        this.setSinkedFromMethod(n, file);
      } else if (get instanceof Statements.EndMethod) {
        this.sinked = undefined; // back to top level
      } else if (get instanceof Statements.Form) {
        this.sinked = [];
        const raising = n.findDirectExpression(Expressions.FormRaising);
        for (const c of raising?.findAllExpressions(Expressions.ClassName) || []) {
          this.sinked.push(c.concatTokens().toUpperCase());
        }
      } else if (get instanceof Statements.EndForm) {
        this.sinked = undefined; // back to top level
      } else if (get instanceof Statements.Raise) {
        let name: string | undefined = undefined;

        const concat = n.concatTokens().toUpperCase();
        if (concat.startsWith("RAISE EXCEPTION TYPE ")) {
          name = n.findFirstExpression(Expressions.ClassName)?.getFirstToken().getStr().toUpperCase();
        }

        this.check(name, n, file);
      } else if (get instanceof Statements.Perform) {
        // todo, PERFORM, or is this not statically checked?
      } else {
        this.checkForMethodCalls(n, file);
      }
    }

  }

////////////////////////////////

  private check(name: string | undefined, n: StatementNode, file: ABAPFile) {
    if (this.isSinked(name) === false) {
      const issue = Issue.atStatement(file, n, "Uncaught exception " + name, this.getMetadata().key, this.getConfig().severity);
      this.issues.push(issue);
    }
  }

  private checkForMethodCalls(n: StatementNode, file: ABAPFile) {
    const start = n.getFirstToken().getStart();
    const end = n.getLastToken().getEnd();

    const scope = this.syntax.spaghetti.lookupPosition(start, file.getFilename());
    for (const r of scope?.getData().references || []) {
      if (r.referenceType === ReferenceType.MethodReference
          && r.position.getStart().isAfter(start)
          && r.position.getEnd().isBefore(end)
          && r.resolved instanceof MethodDefinition) {

        for (const name of r.resolved.getRaising()) {
          this.check(name, n, file);
        }
      }
    }
  }

  private addFromTryStructure(s: StructureNode) {
    if (this.sinked === undefined) {
      return;
    }
    for (const structure of s.findDirectStructures(Structures.Catch)) {
      const c = structure.findDirectStatement(Statements.Catch);
      if (c === undefined) {
        continue;
      }
      for (const cn of c.findDirectExpressions(Expressions.ClassName)) {
        this.sinked.push(cn.concatTokens());
      }
    }
  }

  private setSinkedFromMethod(s: StatementNode, file: ABAPFile) {
    this.sinked = [];

    const scope = this.syntax.spaghetti.lookupPosition(s.getLastToken().getEnd(), file.getFilename());

    let def: MethodDefinition | undefined = undefined;
    for (const r of scope?.getData().references || []) {
      // there should be only one, so the first is okay
      if (r.referenceType === ReferenceType.MethodImplementationReference
          && r.resolved instanceof MethodDefinition) {
        def = r.resolved;
        break;
      }
    }
    if (def === undefined) {
      return; // this should not occur, so just report everything as errors
    }

    def.getRaising().forEach(r => this.sinked?.push(r));
  }

  private isSinked(name: string | undefined): boolean {
    if (this.sinked === undefined || name === undefined) {
      return true;
    }

    const sup = this.globalExceptions[name.toUpperCase()];
    if (sup === "CX_DYNAMIC_CHECK" || sup === "CX_NO_CHECK") {
      return true;
    }

    const lsup = this.localExceptions[name.toUpperCase()];
    if (lsup === "CX_DYNAMIC_CHECK" || lsup === "CX_NO_CHECK") {
      return true;
    }

    return this.sinked.some(a => a.toUpperCase() === name.toUpperCase())
      || ( sup !== undefined && this.isSinked(sup) === true )
      || ( lsup !== undefined && this.isSinked(lsup) === true );
  }

  private findGlobalExceptions() {
    this.globalExceptions = {};
    const ddic = new DDIC(this.reg);
    for (const o of this.reg.getObjects()) {
      if (!(o instanceof Class)) {
        continue;
      }
      const def = o.getMainABAPFile()?.getInfo().getClassDefinitionByName(o.getName());
      if (def === undefined || ddic.isException(def, o) === false) {
        continue;
      }

      this.globalExceptions[o.getName().toUpperCase()] = def.superClassName?.toUpperCase();
    }
  }

  private findLocalExceptions(obj: ABAPObject) {
    this.localExceptions = {};

    for (const file of obj.getABAPFiles()) {
      for (const def of file.getInfo().listClassDefinitions()) {
        if (def.isLocal === true && def.superClassName !== undefined) {
          this.localExceptions[def.name.toUpperCase()] = def.superClassName?.toUpperCase();
        }
      }
    }
  }

}