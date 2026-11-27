import * as Types from "../abap/types/basic";
import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {AnyType, DataReference, GenericObjectReferenceType} from "../abap/types/basic";
import {IObjectAndToken} from "../_iddic_references";
import {LanguageVersion} from "../version";
import {IAllowedNaming} from "./_iobject";

export enum EnhancementCategory {
  NotClassified = "0",
  CannotBeEnhanced = "1",
  Character = "2",
  CharacterOrNumeric = "3",
  Deep = "4",
}

export enum TableCategory {
  Transparent = "TRANSP",
  Structure = "INTTAB",
  Cluster = "CLUSTER",
  Pooled = "POOL",
  View = "VIEW",
  Append = "APPEND",
}

export type SecondaryIndex = {
  name: string,
  fields: string[],
};

type TableField = {
  FIELDNAME: string,
  ROLLNAME?: string,
  COMPTYPE?: string,
  PRECFIELD?: string,
  LENG?: string,
  INTLEN?: string,
  INTTYPE?: string,
  DATATYPE?: string,
  DECIMALS?: string,
  KEYFLAG?: string,
  GROUPNAME?: string,
  CHECKTABLE?: string,
  REFTABLE?: string,
  REFFIELD?: string,
  REFTYPE?: string,
  DDTEXT?: string,
};

export class Table extends AbstractObject {
  private parsedData: {
    tableCategory?: TableCategory | undefined,
    dataClass?: string,
    deliveryClass?: string,
    sizeCategory?: string,
    enhancementCategory?: EnhancementCategory,
    description?: string,
    secondaryIndexes?: SecondaryIndex[],
    fields: TableField[]} | undefined;
  private parsedType: AbstractType | undefined = undefined;

  public getType(): string {
    return "TABL";
  }

  public getDescription(): string | undefined {
    if (this.parsedData === undefined) {
      this.parseXML();
    }

    return this.parsedData?.description;
  }

  public getSecondaryIndexes(): SecondaryIndex[] | undefined {
    if (this.parsedData === undefined) {
      this.parseXML();
    }

    return this.parsedData?.secondaryIndexes;
  }

  public getFields() {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    return this.parsedData?.fields;
  }

  public getAllowedNaming(): IAllowedNaming {
    let length = 30;
    const regex = /^((\/[A-Z_\d]{3,8}\/)|[a-zA-Z0-9]{3}|CI_)\w+$/;

    if (this.getTableCategory() === TableCategory.Transparent) {
      length = 16;
    }

    return {
      maxLength: length,
      allowNamespace: true,
      customRegex: regex,
    };
  }

  public setDirty(): void {
    this.parsedData = undefined;
    this.parsedType = undefined;
    super.setDirty();
  }

  public listKeys(reg: IRegistry): string[] {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData === undefined) {
      return [];
    }

    const ret: string[] = [];
    for (const p of this.parsedData.fields) {
      if (p.KEYFLAG === "X" && (p.FIELDNAME === ".INCLUDE" || p.FIELDNAME.startsWith(".INCLU-"))) {
        let lookup = new DDIC(reg).lookupTableOrView(p.PRECFIELD).type;
        if (lookup instanceof TypedIdentifier) {
          lookup = lookup.getType();
        }
        // same naming as in parseType(), "--AP" are .APPENDS and get no suffix
        const postfix = p.FIELDNAME.startsWith(".INCLU-") && p.FIELDNAME !== ".INCLU--AP"
          ? p.FIELDNAME.substring(".INCLU-".length) : "";
        if (lookup instanceof Types.StructureType) {
          for (const c of lookup.getComponents()) {
            ret.push(c.name + postfix);
          }
        }
      } else if (p.KEYFLAG === "X") {
        ret.push(p.FIELDNAME);
      }
    }
    return ret;
  }

  public parseType(reg: IRegistry): AbstractType {
    if (this.parsedData === undefined) {
      this.parseXML();
      if (this.parsedData === undefined) {
        return new Types.UnknownType("Table, parser error");
      }
    }

    let invalid: AbstractType | undefined;
    if (reg.getConfig().getLanguageVersion() === LanguageVersion.Cloud
        && this.parsedData.dataClass === "USER3") {
      invalid = new Types.UnknownType("Data class = USER3 not allowed in cloud");
    } else if (this.getTableCategory() === TableCategory.Transparent) {
      if (this.listKeys(reg).length === 0) {
        invalid = new Types.UnknownType("Table " + this.getName() + " has no key fields");
      } else if (this.keyFieldsNotFirst()) {
        invalid = new Types.UnknownType("Table " + this.getName() + " key fields must be first");
      }
    }

    if (invalid === undefined && this.parsedType) {
      return this.parsedType;
    }

    // the references are set on every path, also for an invalid table, renaming relies on them
    const references: IObjectAndToken[] = [];
    const type = this.buildType(reg, this.parsedData.fields, references);
    reg.getDDICReferences().setUsing(this, references);

    if (invalid !== undefined) {
      return invalid;
    } else if (type instanceof Types.StructureType) {
      this.parsedType = type;
    }
    return type;
  }

  private buildType(reg: IRegistry, fields: TableField[], references: IObjectAndToken[]): AbstractType {
    const components: Types.IStructureComponent[] = [];
    const ddic = new DDIC(reg);
    // an .INCLUDE that cannot be resolved makes the full structure unknown or void,
    // the fields after it are still looked at, to collect their references
    let failed: AbstractType | undefined;
    for (const field of fields) {
      const comptype = field.COMPTYPE ? field.COMPTYPE : "";
      if (comptype === "E") { // data element
        const lookup = ddic.lookupDataElement(field.ROLLNAME);
        components.push({name: field.FIELDNAME, type: lookup.type});
        if (lookup.object) {
          references.push({object: lookup.object});
        }
      } else if (field.FIELDNAME === ".INCLUDE"
          || field.FIELDNAME.startsWith(".INCLU-")) {
        if (field.PRECFIELD === undefined) {
          failed = failed ?? new Types.UnknownType("Table, parser error, PRECFIELD undefined, " + this.getName());
          continue;
        }
        const lookup = ddic.lookupTableOrView(field.PRECFIELD);
        let found = lookup.type;
        if (lookup.object) {
          references.push({object: lookup.object});
        }
        if (found instanceof TypedIdentifier) {
          found = found.getType();
        }
        if (found instanceof Types.StructureType) {
          if (field.GROUPNAME !== undefined) {
            components.push({name: field.GROUPNAME, type: found, asInclude: true});
          }

          // Note: "--AP" are .APPENDS
          if (field.FIELDNAME.startsWith(".INCLU-") === false || field.FIELDNAME === ".INCLU--AP") {
            for (const c of found.getComponents()) {
              components.push({name: c.name, type: c.type});
            }
          } else if (field.FIELDNAME.startsWith(".INCLU-")) {
            const postfix = field.FIELDNAME.substring(".INCLU-".length);
            for (const c of found.getComponents()) {
              components.push({name: c.name + postfix, type: c.type});
            }
          }
        } else if ((field.PRECFIELD?.startsWith("CI_") || field.PRECFIELD?.startsWith("SI_"))
            && found instanceof Types.UnknownType) {
          continue;
        } else if (found instanceof Types.UnknownType || found instanceof Types.VoidType) {
          // void sets the full structure to void
          failed = failed ?? found;
          continue;
        } else {
          components.push({name: field.FIELDNAME, type: found});
        }
      } else if (comptype === "S") {
        const lookup = ddic.lookupTableOrView(field.ROLLNAME);
        components.push({name: field.FIELDNAME, type: lookup.type});
        if (lookup.object) {
          references.push({object: lookup.object});
        }
      } else if (comptype === "R") {
        if (field.ROLLNAME === undefined) {
          throw new Error("Expected ROLLNAME");
        }
        if (field.ROLLNAME === "DATA") {
          components.push({
            name: field.FIELDNAME,
            type: new DataReference(AnyType.get())});
        } else if (field.ROLLNAME === "OBJECT") {
          components.push({
            name: field.FIELDNAME,
            type: new GenericObjectReferenceType()});
        } else if (field.REFTYPE === "S") {
          const lookup = ddic.lookupTableOrView(field.ROLLNAME);
          components.push({name: field.FIELDNAME, type: new DataReference(lookup.type)});
          if (lookup.object) {
            references.push({object: lookup.object});
          }
        } else if (field.REFTYPE === "L") {
          const lookup = ddic.lookupTableType(field.ROLLNAME);
          components.push({name: field.FIELDNAME, type: new DataReference(lookup.type)});
          if (lookup.object) {
            references.push({object: lookup.object});
          }
        } else if (field.REFTYPE === "E") {
          const lookup = ddic.lookupDataElement(field.ROLLNAME);
          components.push({name: field.FIELDNAME, type: new DataReference(lookup.type)});
          if (lookup.object) {
            references.push({object: lookup.object});
          }
        } else {
          const lookup = ddic.lookupObject(field.ROLLNAME);
          components.push({name: field.FIELDNAME, type: lookup.type});
          if (lookup.object) {
            references.push({object: lookup.object});
          }
        }
      } else if (comptype === "L") {
        const lookup = ddic.lookupTableType(field.ROLLNAME);
        components.push({name: field.FIELDNAME, type: lookup.type});
        if (lookup.object) {
          references.push({object: lookup.object});
        }
      } else if (comptype === "") { // built in
        if (field.ROLLNAME) {
          // typed with a data element, but its built-in type is given directly, still a reference
          const dtel = reg.getObject("DTEL", field.ROLLNAME);
          if (dtel) {
            references.push({object: dtel});
          }
        }
        const datatype = field.DATATYPE;
        if (datatype === undefined) {
          throw new Error("Expected DATATYPE, while parsing TABL " + this.getName());
        }
        const length = field.LENG ? field.LENG : field.INTLEN;
        components.push({
          name: field.FIELDNAME,
          type: ddic.textToType({
            text: datatype,
            length: length,
            decimals: field.DECIMALS,
            infoText: this.getName() + "-" + field.FIELDNAME,
            description: field.DDTEXT,
          })});
      } else {
        components.push({
          name: field.FIELDNAME,
          type: new Types.UnknownType("Table " + this.getName() + ", unknown component type \"" + comptype + "\"")});
      }

      if (field.CHECKTABLE) {
        const lookup = ddic.lookupTableOrView2(field.CHECKTABLE);
        if (lookup) {
          references.push({object: lookup});
        }
      }
    }

    if (failed !== undefined) {
      return failed;
    } else if (components.length === 0) {
      return new Types.UnknownType("Table/Structure " + this.getName() + " does not contain any components");
    }

    return new Types.StructureType(components, this.getName(), this.getName(), this.getDescription());
  }

  public getTableCategory(): TableCategory | undefined {
    if (this.parsedData === undefined) {
      this.parseXML();
    }

    return this.parsedData?.tableCategory;
  }

  public getDeliveryClass(): string | undefined {
    if (this.parsedData === undefined) {
      this.parseXML();
    }

    return this.parsedData?.deliveryClass;
  }

  public getSizeCategory(): string | undefined {
    if (this.parsedData === undefined) {
      this.parseXML();
    }

    return this.parsedData?.sizeCategory;
  }

  public getEnhancementCategory(): EnhancementCategory {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData?.enhancementCategory === undefined) {
      return EnhancementCategory.NotClassified;
    }
    return this.parsedData.enhancementCategory;
  }

///////////////

  private keyFieldsNotFirst(): boolean {
    let seenNonKey = false;
    for (const field of this.parsedData?.fields || []) {
      if (field.KEYFLAG === "X") {
        if (seenNonKey === true) {
          return true;
        }
      } else {
        seenNonKey = true;
      }
    }
    return false;
  }

  private parseXML() {
    const parsed = super.parseRaw2();
    if (parsed === undefined) {
      return;
    }

    this.parsedData = {fields: []};

    if (parsed.abapGit === undefined) {
      return;
    }

// enhancement category
    if (parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD02V?.EXCLASS === undefined) {
      this.parsedData.enhancementCategory = EnhancementCategory.NotClassified;
    } else {
      this.parsedData.enhancementCategory = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD02V?.EXCLASS;
    }

// table category
    this.parsedData.tableCategory = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD02V?.TABCLASS;
    this.parsedData.description = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD02V?.DDTEXT;
    this.parsedData.dataClass = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD09L?.TABART;
    this.parsedData.deliveryClass = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD02V?.CONTFLAG;
    this.parsedData.sizeCategory = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD09L?.TABKAT;

// fields
    const fields = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD03P_TABLE;
    for (const field of xmlToArray(fields?.DD03P)) {
      if (typeof field?.FIELDNAME !== "string") {
        continue;
      }
      this.parsedData.fields.push({
        FIELDNAME: field.FIELDNAME,
        ROLLNAME: field.ROLLNAME,
        COMPTYPE: field.COMPTYPE,
        PRECFIELD: field.PRECFIELD,
        LENG: field.LENG,
        INTLEN: field.INTLEN,
        INTTYPE: field.INTTYPE,
        DATATYPE: field.DATATYPE,
        DECIMALS: field.DECIMALS,
        KEYFLAG: field.KEYFLAG,
        GROUPNAME: field.GROUPNAME,
        CHECKTABLE: field.CHECKTABLE,
        REFTABLE: field.REFTABLE,
        REFFIELD: field.REFFIELD,
        REFTYPE: field.REFTYPE,
        DDTEXT: field.DDTEXT,
      });
    }

// secondary indexes
    const indexes = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD12V;;
    this.parsedData.secondaryIndexes = [];
    for (const index of xmlToArray(indexes?.DD12V)) {
      const indexName = index.INDEXNAME;
      const indexFields: string[] = [];
      const indexFieldsXml = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.DD17V;
      for (const indexField of xmlToArray(indexFieldsXml?.DD17V)) {
        if (indexField.INDEXNAME === indexName) {
          // assumption: fields are listed by POSITION in the xml
          indexFields.push(indexField.FIELDNAME);
        }
      }
      this.parsedData.secondaryIndexes.push({
        name: indexName,
        fields: indexFields,
      });
    }
  }

}
