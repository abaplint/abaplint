import * as Types from "../abap/types/basic";
import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {AnyType, DataReference, GenericObjectReferenceType} from "../abap/types/basic";
import {IObjectAndToken} from "../_iddic_references";

export enum EnhancementCategory {
  NotClassified = "0",
  CannotBeEhanced = "1",
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

export class Table extends AbstractObject {
  private parsedData: {
    tableCategory?: TableCategory | undefined,
    enhancementCategory?: EnhancementCategory,
    fields: {
      FIELDNAME: string,
      ROLLNAME?: string,
      COMPTYPE?: string,
      PRECFIELD?: string,
      LENG?: string,
      INTLEN?: string,
      DATATYPE?: string,
      DECIMALS?: string,
      KEYFLAG?: string,
      GROUPNAME?: string,
      CHECKTABLE?: string,
      REFTYPE?: string,
    }[]} | undefined;

  public getType(): string {
    return "TABL";
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedData = undefined;
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
      if (p.KEYFLAG === "X" && p.FIELDNAME === ".INCLUDE") {
        const lookup = new DDIC(reg).lookupTableOrView(p.PRECFIELD).type;
        if (lookup instanceof Types.StructureType) {
          for (const c of lookup.getComponents()) {
            ret.push(c.name);
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

    const references: IObjectAndToken[] = [];
    const components: Types.IStructureComponent[] = [];
    const ddic = new DDIC(reg);
    for (const field of this.parsedData.fields) {
      const comptype = field.COMPTYPE ? field.COMPTYPE : "";
      if (comptype === "E") { // data element
        const lookup = ddic.lookupDataElement(field.ROLLNAME);
        components.push({name: field.FIELDNAME, type: lookup.type});
        if (lookup.object) {
          references.push({object: lookup.object});
        }
      } else if (field.FIELDNAME === ".INCLUDE" || field.FIELDNAME === ".INCLU--AP") { // incude or append structure
        if (field.PRECFIELD === undefined) {
          return new Types.UnknownType("Table, parser error, PRECFIELD undefined");
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
            components.push({name: field.GROUPNAME, type: found});
          }
          for (const c of found.getComponents()) {
            components.push({name: c.name, type: c.type});
          }
        } else if ((field.PRECFIELD?.startsWith("CI_") || field.PRECFIELD?.startsWith("SI_"))
            && found instanceof Types.UnknownType) {
          continue;
        } else if (found instanceof Types.UnknownType) {
          return found;
        } else if (found instanceof Types.VoidType) {
          // set the full structure to void
          return found;
        } else {
          components.push({name: field.FIELDNAME, type: found});
        }
      } else if (comptype === "S" && field.FIELDNAME.startsWith(".INCLU-")) {
        const lookup = ddic.lookupTableOrView(field.PRECFIELD);
        if (lookup.object) {
          references.push({object: lookup.object});
        }
        const found = lookup.type;
        if (found instanceof Types.VoidType) {
          // set the full structure to void
          return found;
        } else if (found instanceof Types.StructureType) {
          const suffix = field.FIELDNAME.split("-")[1];
          for (const c of found.getComponents()) {
            components.push({name: c.name + suffix, type: c.type});
          }
        } else if (found instanceof Types.UnknownType) {
          return found;
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
            type: new DataReference(new AnyType())});
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
        const datatype = field.DATATYPE;
        if (datatype === undefined) {
          throw new Error("Expected DATATYPE, while parsing TABL " + this.getName());
        }
        const length = field.LENG ? field.LENG : field.INTLEN;
        components.push({
          name: field.FIELDNAME,
          type: ddic.textToType(datatype, length, field.DECIMALS, this.getName() + "-" + field.FIELDNAME)});
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

    if (components.length === 0) {
      return new Types.UnknownType("Table/Structure " + this.getName() + " does not contain any components");
    }

    reg.getDDICReferences().setUsing(this, references);
    return new Types.StructureType(components, this.getName());
  }

  public getTableCategory(): TableCategory | undefined {
    if (this.parsedData === undefined) {
      this.parseXML();
    }

    return this.parsedData?.tableCategory;
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
    if (parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.EXCLASS === undefined) {
      this.parsedData.enhancementCategory = EnhancementCategory.NotClassified;
    } else {
      this.parsedData.enhancementCategory = parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.EXCLASS;
    }

// table category
    this.parsedData.tableCategory = parsed.abapGit["asx:abap"]["asx:values"]?.DD02V?.TABCLASS;

// fields
    const fields = parsed.abapGit["asx:abap"]["asx:values"]?.DD03P_TABLE;
    for (const field of xmlToArray(fields?.DD03P)) {
      this.parsedData.fields.push({
        FIELDNAME: field.FIELDNAME,
        ROLLNAME: field.ROLLNAME,
        COMPTYPE: field.COMPTYPE,
        PRECFIELD: field.PRECFIELD,
        LENG: field.LENG,
        INTLEN: field.INTLEN,
        DATATYPE: field.DATATYPE,
        DECIMALS: field.DECIMALS,
        KEYFLAG: field.KEYFLAG,
        GROUPNAME: field.GROUPNAME,
        CHECKTABLE: field.CHECKTABLE,
        REFTYPE: field.REFTYPE,
      });
    }
  }

}
