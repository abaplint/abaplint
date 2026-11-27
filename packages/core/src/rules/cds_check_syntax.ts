import {ExpressionNode, TokenNode} from "../abap/nodes";
import {StructureType, UnknownType, VoidType} from "../abap/types/basic";
import {
  CDSAggregate, CDSAnnotation, CDSArithParen, CDSArithmetics, CDSAs, CDSAssociation, CDSCase, CDSCast, CDSComposition,
  CDSCondition, CDSDefineAbstract, CDSDefineProjection, CDSDefineView, CDSElement, CDSFunction, CDSGroupBy, CDSHaving,
  CDSInteger, CDSName, CDSPrefixedName, CDSProviderContract, CDSRelation, CDSSelect, CDSSource, CDSString, CDSType, CDSWhere,
} from "../cds/expressions";
import {DDIC} from "../ddic";
import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {DataDefinition, DataElement} from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";

export class CDSCheckSyntaxConf extends BasicRuleConfig {
}

type Source = {
  entity: string,
  names: string[],
  type: StructureType | UnknownType | VoidType,
};

const KNOWN_QUAN_DATA_ELEMENTS = ["MENGE_D"];
const KNOWN_CURR_DATA_ELEMENTS = ["BWERT", "DZWERT"];

// Reserved names, cannot be used as element names, see DDIC table TRESE
const RESERVED_ELEMENT_NAMES = ["BEGIN", "NUMBER", "POSITION", "ZONE", "HANDLER", "SECTION"];

const MAX_LABEL_LENGTH = 40;

// Annotations which are not supported in CDS view entities
const VIEW_ENTITY_FORBIDDEN_ANNOTATIONS = ["Semantics.unitOfMeasure", "Semantics.currencyCode"];

// Select list elements which are expressions, ie. not plain fields
const CALCULATED_ELEMENT = [CDSCast, CDSCase, CDSArithmetics, CDSArithParen, CDSFunction, CDSAggregate, CDSString, CDSInteger];

export class CDSCheckSyntax implements IRule {
  private reg: IRegistry;
  private conf = new CDSCheckSyntaxConf();
  private businessObjectTargets: Set<string> | undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_check_syntax",
      title: "CDS Check Syntax",
      shortDescription: "Checks CDS source, field, type, and semantic annotation references",
      extendedInformation: `Performs semantic checks which require other DDIC objects to be available.

Missing objects are only reported when their names match the configured errorNamespace.

SOURCE_TYPE in the abapGit XML is checked to match the DDL source, W view entity, P projection view, V DDIC-based view.`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSCheckSyntaxConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    this.businessObjectTargets = undefined;
    return this;
  }

  public run(object: IObject): Issue[] {
    if (!(object instanceof DataDefinition)) {
      return [];
    }

    const tree = object.getTree();
    const file = object.findSourceFile();
    if (tree === undefined || file === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    const ddic = new DDIC(this.reg);
    const sources = this.findSources(tree, ddic, issues, file);

    this.checkRelations(tree, ddic, issues, file);
    this.checkTypes(tree, ddic, issues, file);
    if (this.checkRootProjection(tree, ddic, issues, file) === false) {
      this.checkTransactionalProjection(tree, ddic, issues, file);
    }
    this.checkCalculatedAssociationPaths(tree, issues, file);
    this.checkFieldAnnotations(tree, ddic, issues, file);
    this.checkLabels(tree, issues, file);
    this.checkViewEntityAnnotations(tree, issues, file);
    this.checkSearchable(tree, issues, file);
    this.checkReservedNames(tree, issues, file);
    this.checkFields(tree, sources, object, issues, file);
    this.checkSourceType(tree, object, issues);

    return issues;
  }

  private findSources(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile): Source[] {
    const sources: Source[] = [];

    for (const node of tree.findAllExpressionsRecursive(CDSSource)) {
      const prefixed = node.findDirectExpression(CDSPrefixedName);
      const entityNode = prefixed?.findDirectExpression(CDSName);
      if (entityNode === undefined) {
        continue;
      }

      const entity = this.name(entityNode);
      const asName = node.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
      const bareAlias = node.findDirectExpression(CDSName);
      const alias = asName === undefined ? bareAlias : asName;
      const lookup = ddic.lookupTableOrView(entity);

      if (lookup.type instanceof UnknownType && lookup.object === undefined && this.reg.inErrorNamespace(entity)) {
        issues.push(Issue.atToken(file, entityNode.getFirstToken(), `CDS source "${entity}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }

      if (lookup.type instanceof StructureType || lookup.type instanceof UnknownType || lookup.type instanceof VoidType) {
        const names = [entity.toUpperCase()];
        if (alias) {
          names.push(this.name(alias).toUpperCase());
        }
        sources.push({entity, names, type: lookup.type});
      }
    }

    return sources;
  }

  private checkRelations(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile) {
    for (const relation of tree.findAllExpressionsRecursive(CDSRelation)) {
      const directTokens = relation.getDirectTokens();
      if (directTokens.length === 0) {
        continue;
      }
      const entity = directTokens.map(t => t.getStr()).join("");
      const lookup = ddic.lookupTableOrView(entity);
      if (lookup.type instanceof UnknownType && lookup.object === undefined && this.reg.inErrorNamespace(entity)) {
        issues.push(Issue.atToken(file, directTokens[0], `CDS source "${entity}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private checkTypes(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile) {
    for (const typeNode of tree.findAllExpressionsRecursive(CDSType)) {
      const typeName = typeNode.findDirectExpressions(CDSName).map(n => this.name(n)).join(".");
      if (typeName === "" || typeName.toUpperCase().startsWith("ABAP.")) {
        continue;
      }

      const lookup = ddic.lookup(typeName);
      if (lookup.type instanceof UnknownType && lookup.object === undefined && this.reg.inErrorNamespace(typeName)) {
        issues.push(Issue.atToken(file, typeNode.getFirstToken(), `CDS type "${typeName}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  /** returns true if an issue was reported */
  private checkRootProjection(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile): boolean {
    const projection = tree.findFirstExpression(CDSDefineProjection);
    const rootToken = projection?.findDirectTokenByText("ROOT");
    if (projection === undefined || rootToken === undefined) {
      return false;
    }

    const names = projection.findDirectExpressions(CDSName);
    const projectedEntityNode = names[1];
    if (projectedEntityNode === undefined) {
      return false;
    }

    const projectedEntityName = this.name(projectedEntityNode);
    const projectedEntity = ddic.lookupTableOrView(projectedEntityName).object;
    if (projectedEntity instanceof DataDefinition
        && projectedEntity.getTree()?.findDirectTokenByText("ROOT") === undefined) {
      const message = `ROOT keyword not valid since ${projectedEntityName} is not a root property`;
      issues.push(Issue.atToken(file, rootToken, message, this.getMetadata().key, this.conf.severity));
      return true;
    }
    return false;
  }

  /** a transactional projection(no provider contract or TRANSACTIONAL_QUERY) requires a business object entity */
  private checkTransactionalProjection(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile) {
    const projection = tree.findFirstExpression(CDSDefineProjection);
    if (projection === undefined || projection.findDirectTokenByText("TRANSIENT") !== undefined) {
      return;
    }

    const contract = projection.findDirectExpression(CDSProviderContract);
    if (contract !== undefined && contract.findDirectTokenByText("TRANSACTIONAL_QUERY") === undefined) {
      return;
    }

    const projectedEntityNode = projection.findDirectExpressions(CDSName)[1];
    if (projectedEntityNode === undefined) {
      return;
    }

    const projectedEntityName = this.name(projectedEntityNode);
    const projectedEntity = ddic.lookupTableOrView(projectedEntityName).object;
    if (!(projectedEntity instanceof DataDefinition)) {
      return;
    }
    const projectedTree = projectedEntity.getTree();
    // only plain select based views are checked, ie. not projections, abstract or custom entities
    if (projectedTree === undefined || !(projectedTree.get() instanceof CDSDefineView)) {
      return;
    }

    if (projectedTree.findDirectTokenByText("ROOT") !== undefined
        || projectedTree.findAllExpressionsRecursive(CDSComposition).length > 0
        || projectedTree.findAllExpressionsRecursive(CDSAssociation).some(a => a.findDirectTokenByText("PARENT") !== undefined)) {
      return;
    }

    const candidates = [projectedEntityName.toUpperCase(), projectedEntity.getName().toUpperCase()];
    const definitionName = projectedEntity.getDefinitionName();
    if (definitionName !== undefined) {
      candidates.push(definitionName.toUpperCase());
    }
    const targets = this.findBusinessObjectTargets();
    if (candidates.some(c => targets.has(c))) {
      return;
    }

    const message = `Transactional projection on ${projectedEntityName} not possible, ` +
      `${projectedEntityName} is not a root entity or part of a composition`;
    issues.push(Issue.atToken(file, projectedEntityNode.getFirstToken(), message,
                              this.getMetadata().key, this.conf.severity));
  }

  /** names of entities targeted by a composition or an association to parent in any DDLS in the registry */
  private findBusinessObjectTargets(): Set<string> {
    if (this.businessObjectTargets !== undefined) {
      return this.businessObjectTargets;
    }

    const targets = new Set<string>();
    for (const obj of this.reg.getObjectsByType("DDLS")) {
      const tree = (obj as DataDefinition).getTree();
      if (tree === undefined) {
        continue;
      }
      const relations: ExpressionNode[] = [];
      for (const composition of tree.findAllExpressionsRecursive(CDSComposition)) {
        const relation = composition.findDirectExpression(CDSRelation);
        if (relation) {
          relations.push(relation);
        }
      }
      for (const association of tree.findAllExpressionsRecursive(CDSAssociation)) {
        const relation = association.findDirectExpression(CDSRelation);
        if (relation && association.findDirectTokenByText("PARENT") !== undefined) {
          relations.push(relation);
        }
      }
      for (const relation of relations) {
        const name = relation.getDirectTokens().map(t => t.getStr()).join("");
        if (name !== "") {
          targets.add(name.toUpperCase());
        }
      }
    }

    this.businessObjectTargets = targets;
    return targets;
  }

  /** path expressions are not possible via an association whose ON condition uses a calculated element */
  private checkCalculatedAssociationPaths(tree: ExpressionNode, issues: Issue[], file: IFile) {
    for (const select of tree.findAllExpressionsRecursive(CDSSelect)) {
      const elements = select.findDirectExpressions(CDSElement);

      const calculated = new Map<string, string>();
      for (const element of elements) {
        const name = element.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
        if (name !== undefined && element.findDirectExpressionsMulti(CALCULATED_ELEMENT).length > 0) {
          calculated.set(this.name(name).toUpperCase(), this.name(name));
        }
      }
      if (calculated.size === 0) {
        continue;
      }

      const marked = new Map<string, string>();
      for (const association of select.findDirectExpressions(CDSAssociation)) {
        const relation = association.findDirectExpression(CDSRelation);
        const condition = association.findDirectExpression(CDSCondition);
        if (relation === undefined || condition === undefined) {
          continue;
        }
        const aliasNode = relation.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
        const alias = aliasNode ? this.name(aliasNode) : relation.getDirectTokens().map(t => t.getStr()).join("");

        for (const prefixed of condition.findAllExpressionsRecursive(CDSPrefixedName)) {
          const names = prefixed.findDirectExpressions(CDSName);
          if (names.length !== 2 || this.name(names[0]).toUpperCase() !== "$PROJECTION") {
            continue;
          }
          const element = calculated.get(this.name(names[1]).toUpperCase());
          if (element !== undefined && marked.has(alias.toUpperCase()) === false) {
            marked.set(alias.toUpperCase(), element);
          }
        }
      }
      if (marked.size === 0) {
        continue;
      }

      const usages: ExpressionNode[] = [...elements];
      for (const clause of select.findDirectExpressionsMulti([CDSWhere, CDSGroupBy, CDSHaving])) {
        usages.push(clause);
      }
      for (const usage of usages) {
        for (const prefixed of this.findPrefixedNames(usage)) {
          const names = prefixed.findDirectExpressions(CDSName);
          if (names.length < 2) {
            continue;
          }
          const alias = this.name(names[0]);
          const element = marked.get(alias.toUpperCase());
          if (element === undefined) {
            continue;
          }
          const message = `Path expression via ${alias} not possible, ` +
            `its ON condition uses calculated element ${element}`;
          issues.push(Issue.atToken(file, names[0].getFirstToken(), message,
                                    this.getMetadata().key, this.conf.severity));
        }
      }
    }
  }

  /** outermost prefixed names, skipping annotations */
  private findPrefixedNames(node: ExpressionNode): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of node.getChildren()) {
      if (!(child instanceof ExpressionNode) || child.get() instanceof CDSAnnotation) {
        continue;
      } else if (child.get() instanceof CDSPrefixedName) {
        ret.push(child);
      } else {
        ret.push(...this.findPrefixedNames(child));
      }
    }
    return ret;
  }

  private checkFieldAnnotations(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile) {
    const definition = tree.findFirstExpression(CDSDefineAbstract);
    if (definition === undefined) {
      return;
    }

    let definitionNameSeen = false;
    let fieldName: ExpressionNode | undefined;
    let annotations: ExpressionNode[] = [];
    const fields: {
      name: string,
      node: ExpressionNode,
      annotations: string[],
      semanticType: "QUAN" | "CURR" | undefined,
    }[] = [];

    for (const child of definition.getChildren()) {
      if (child instanceof TokenNode) {
        if (child.get().getStr() === ";") {
          fieldName = undefined;
          annotations = [];
        }
        continue;
      } else if (child.get() instanceof CDSAnnotation) {
        annotations.push(child);
      } else if (child.get() instanceof CDSName) {
        if (definitionNameSeen === false) {
          definitionNameSeen = true;
          annotations = [];
        } else {
          fieldName = child;
        }
      } else if (child.get() instanceof CDSType && fieldName !== undefined) {
        const semanticType = this.determineSemanticType(child, ddic);
        const normalizedAnnotations = annotations.map(a => a.concatTokens().replace(/\s/g, ""));
        fields.push({name: this.name(fieldName), node: fieldName, annotations: normalizedAnnotations, semanticType});

        fieldName = undefined;
        annotations = [];
      }
    }

    const reportedCompanionFields = new Set<string>();
    for (const field of fields) {
      if (field.semanticType === undefined) {
        continue;
      }

      const quantity = field.semanticType === "QUAN";
      const referenceAnnotation = quantity ? "@Semantics.quantity.unitOfMeasure" : "@Semantics.amount.currencyCode";
      const companionAnnotation = quantity ? "@Semantics.unitOfMeasure: true" : "@Semantics.currencyCode: true";
      const reference = this.findSemanticReference(field.annotations, field.semanticType);
      if (reference === undefined) {
        const kind = quantity ? "quantity" : "amount";
        const message = `CDS ${kind} field "${field.name}" requires ${referenceAnnotation}`;
        issues.push(Issue.atToken(file, field.node.getFirstToken(), message,
                                  this.getMetadata().key, this.conf.severity));
        continue;
      }

      const companion = fields.find(f => f.name.toUpperCase() === reference.toUpperCase());
      if (companion === undefined) {
        const kind = quantity ? "unit" : "currency";
        const message = `CDS field "${field.name}" references missing ${kind} field "${reference}"`;
        issues.push(Issue.atToken(file, field.node.getFirstToken(), message,
                                  this.getMetadata().key, this.conf.severity));
        continue;
      }

      const companionKey = field.semanticType + ":" + companion.name.toUpperCase();
      if (reportedCompanionFields.has(companionKey) === false
          && this.hasCompanionAnnotation(companion.annotations, field.semanticType) === false) {
        const message = `CDS field "${companion.name}" requires ${companionAnnotation}`;
        issues.push(Issue.atToken(file, companion.node.getFirstToken(), message,
                                  this.getMetadata().key, this.conf.severity));
        reportedCompanionFields.add(companionKey);
      }
    }
  }

  private determineSemanticType(typeNode: ExpressionNode, ddic: DDIC): "QUAN" | "CURR" | undefined {
    const typeName = typeNode.findDirectExpressions(CDSName).map(n => this.name(n)).join(".");
    const upper = typeName.toUpperCase();
    if (upper === "ABAP.QUAN" || KNOWN_QUAN_DATA_ELEMENTS.includes(upper)) {
      return "QUAN";
    } else if (upper === "ABAP.CURR" || KNOWN_CURR_DATA_ELEMENTS.includes(upper)) {
      return "CURR";
    }

    const object = ddic.lookup(typeName).object;
    if (object instanceof DataElement) {
      const dataType = object.getDataType(this.reg)?.toUpperCase();
      if (dataType === "QUAN" || dataType === "CURR") {
        return dataType;
      }
    }
    return undefined;
  }

  private findSemanticReference(annotations: string[], type: "QUAN" | "CURR"): string | undefined {
    const expression = type === "QUAN"
      ? /(?:SEMANTICS\.QUANTITY|SEMANTICS:\{QUANTITY:\{)\.?UNITOFMEASURE:'([^']+)'/i
      : /(?:SEMANTICS\.AMOUNT|SEMANTICS:\{AMOUNT:\{)\.?CURRENCYCODE:'([^']+)'/i;
    for (const annotation of annotations) {
      const match = annotation.match(expression);
      if (match) {
        return match[1];
      }
    }
    return undefined;
  }

  private hasCompanionAnnotation(annotations: string[], type: "QUAN" | "CURR"): boolean {
    if (type === "QUAN") {
      return annotations.some(a => a.toUpperCase().includes("@SEMANTICS.UNITOFMEASURE:TRUE")
        || a.toUpperCase().includes("@SEMANTICS:{UNITOFMEASURE:TRUE"));
    } else {
      return annotations.some(a => a.toUpperCase().includes("@SEMANTICS.CURRENCYCODE:TRUE")
        || a.toUpperCase().includes("@SEMANTICS:{CURRENCYCODE:TRUE"));
    }
  }

  private checkLabels(tree: ExpressionNode, issues: Issue[], file: IFile) {
    for (const annotation of tree.findAllExpressionsRecursive(CDSAnnotation)) {
      const concatenated = annotation.concatTokens();
      if (/@\s*<?\s*EndUserText/i.test(concatenated) === false) {
        continue;
      }

      const expression = /label\s*:\s*'((?:[^']|'')*)'/gi;
      let match = expression.exec(concatenated);
      while (match !== null) {
        const label = match[1].replace(/''/g, "'");
        if (label.length > MAX_LABEL_LENGTH) {
          const message = `CDS label is ${label.length} characters, maximum is ${MAX_LABEL_LENGTH}`;
          issues.push(Issue.atToken(file, annotation.getFirstToken(), message,
                                    this.getMetadata().key, this.conf.severity));
        }
        match = expression.exec(concatenated);
      }
    }
  }

  private checkViewEntityAnnotations(tree: ExpressionNode, issues: Issue[], file: IFile) {
    const view = tree.findFirstExpression(CDSDefineView);
    if (view === undefined || view.findDirectTokenByText("ENTITY") === undefined) {
      return;
    }

    for (const annotation of tree.findAllExpressionsRecursive(CDSAnnotation)) {
      const normalized = annotation.concatTokens().replace(/\s/g, "").toUpperCase().replace(/^@</, "@");
      for (const forbidden of VIEW_ENTITY_FORBIDDEN_ANNOTATIONS) {
        const upper = forbidden.toUpperCase();
        if (normalized.startsWith("@" + upper) === false
            && normalized.startsWith("@" + upper.replace(".", ":{")) === false) {
          continue;
        }
        const message = `Annotation ${forbidden} is not allowed in view entities`;
        issues.push(Issue.atToken(file, annotation.getFirstToken(), message,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private checkSearchable(tree: ExpressionNode, issues: Issue[], file: IFile) {
    let searchable: ExpressionNode | undefined;

    for (const annotation of tree.findAllExpressionsRecursive(CDSAnnotation)) {
      const normalized = annotation.concatTokens().replace(/\s/g, "").toUpperCase().replace(/^@</, "@");
      if (this.hasSearchAnnotation(normalized, /[.{,]DEFAULTSEARCHELEMENT:TRUE/)) {
        return;
      } else if (searchable === undefined && this.hasSearchAnnotation(normalized, /[.{,]SEARCHABLE:TRUE/)) {
        searchable = annotation;
      }
    }

    if (searchable !== undefined) {
      const message = "@Search.defaultSearchElement: true required on at least one element " +
        "when @Search.searchable: true";
      issues.push(Issue.atToken(file, searchable.getFirstToken(), message,
                                this.getMetadata().key, this.conf.severity));
    }
  }

  private hasSearchAnnotation(normalized: string, annotation: RegExp): boolean {
    if (normalized.startsWith("@SEARCH") === false) {
      return false;
    }
    return annotation.test(normalized);
  }

  private checkReservedNames(tree: ExpressionNode, issues: Issue[], file: IFile) {
    for (const element of tree.findAllExpressionsRecursive(CDSElement)) {
      if (element.findDirectTokenByText("INCLUDE") !== undefined) {
        continue;
      }

      let nameNode = element.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
      if (nameNode === undefined) {
        const names = element.findDirectExpression(CDSPrefixedName)?.findDirectExpressions(CDSName) || [];
        nameNode = names[names.length - 1];
      }
      if (nameNode === undefined) {
        continue;
      }

      const name = this.name(nameNode);
      if (RESERVED_ELEMENT_NAMES.includes(name.toUpperCase())) {
        issues.push(Issue.atToken(file, nameNode.getFirstToken(), `CDS element name "${name}" is reserved`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  /** SOURCE_TYPE in the XML must match the DDL source, only the confirmed W/P/V mappings are checked */
  private checkSourceType(tree: ExpressionNode, object: DataDefinition, issues: Issue[]) {
    const sourceType = object.getSourceType();
    const xmlFile = object.getXMLFile();
    if (sourceType === undefined || xmlFile === undefined || ["W", "P", "V"].includes(sourceType) === false) {
      return;
    }

    // other definitions(abstract, custom, table functions, etc.) are skipped
    let expected: string | undefined = undefined;
    if (tree.get() instanceof CDSDefineView && tree.findDirectTokenByText("WRITABLE") === undefined) {
      if (tree.findDirectTokenByText("ENTITY") !== undefined) {
        expected = "W";
      } else if (object.getSQLViewName() !== undefined) {
        expected = "V";
      }
    } else if (tree.get() instanceof CDSDefineProjection && tree.findDirectTokenByText("ENTITY") !== undefined) {
      expected = "P";
    }

    if (expected === undefined || expected === sourceType) {
      return;
    }

    const xml = xmlFile.getRaw();
    const index = xml.indexOf("<SOURCE_TYPE>");
    const row = index < 0 ? 1 : xml.substring(0, index).split("\n").length;
    const message = `SOURCE_TYPE "${sourceType}" does not match DDL source, expected "${expected}"`;
    issues.push(Issue.atRow(xmlFile, row, message, this.getMetadata().key, this.conf.severity));
  }

  private checkFields(tree: ExpressionNode, sources: Source[], object: DataDefinition,
                      issues: Issue[], file: IFile) {
    const associationNames = new Set<string>();
    for (const association of object.getParsedData()?.associations || []) {
      associationNames.add(association.name.toUpperCase());
      if (association.as) {
        associationNames.add(association.as.toUpperCase());
      }
    }
    for (const composition of tree.findAllExpressionsRecursive(CDSComposition)) {
      const relation = composition.findDirectExpression(CDSRelation);
      if (relation === undefined) {
        continue;
      }
      // direct tokens exclude the alias and parameters, and include a namespace like /ABC/
      const name = relation.getDirectTokens().map(t => t.getStr()).join("");
      if (name !== "") {
        associationNames.add(name.toUpperCase());
      }
      const alias = relation.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
      if (alias) {
        associationNames.add(this.name(alias).toUpperCase());
      }
    }

    for (const element of tree.findAllExpressionsRecursive(CDSElement)) {
      const prefixed = element.findDirectExpression(CDSPrefixedName);
      if (prefixed === undefined) {
        continue;
      }

      const names = prefixed.findDirectExpressions(CDSName);
      if (names.length === 0) {
        continue;
      }

      const first = this.name(names[0]);
      if (first === "*" || first.startsWith("$") || first.startsWith("#") || associationNames.has(first.toUpperCase())) {
        continue;
      }

      if (names.length > 1) {
        const matchingSources = sources.filter(s => s.names.includes(first.toUpperCase()));
        if (matchingSources.length !== 1) {
          continue;
        }
        const source = matchingSources[0];
        const sourceType = source.type;
        if (!(sourceType instanceof StructureType)) {
          continue;
        }
        const field = this.name(names[1]);
        if (field !== "*" && sourceType.getComponentByName(field) === undefined) {
          issues.push(Issue.atToken(file, names[1].getFirstToken(), `CDS field "${field}" not found in "${source.entity}"`,
                                    this.getMetadata().key, this.conf.severity));
        }
        continue;
      }

      // Do not guess across joins or when a dependency is absent.
      if (sources.length !== 1) {
        continue;
      }

      const source = sources[0];
      const sourceType = source.type;
      if (!(sourceType instanceof StructureType)) {
        continue;
      }
      if (sourceType.getComponentByName(first) === undefined) {
        issues.push(Issue.atToken(file, names[0].getFirstToken(), `CDS field "${first}" not found in "${source.entity}"`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private name(node: ExpressionNode): string {
    return node.concatTokens().replace(/ /g, "");
  }
}
