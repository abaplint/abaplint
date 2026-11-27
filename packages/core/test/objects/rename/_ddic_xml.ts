import {MemoryFile} from "../../../src/files/memory_file";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

// abapGit XML of small DDIC objects, for testing that renames reach the DDIC references

export function tablXML(name: string, fields: string[], tabclass = "INTTAB", extra = ""): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>${name.toUpperCase()}</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>${tabclass}</TABCLASS>
    <DDTEXT>x</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
${fields.join("\n")}
   </DD03P_TABLE>${extra}
  </asx:values>
 </asx:abap>
</abapGit>`;
}

/** field typed with a data element */
export function dtelField(field: string, rollname: string, more = ""): string {
  return `    <DD03P><FIELDNAME>${field}</FIELDNAME><ROLLNAME>${rollname}</ROLLNAME>` +
    `<ADMINFIELD>0</ADMINFIELD><COMPTYPE>E</COMPTYPE>${more}</DD03P>`;
}

/** field with a data element, but without COMPTYPE, its built-in type given directly */
export function dtelFieldNoComptype(field: string, rollname: string): string {
  return `    <DD03P><FIELDNAME>${field}</FIELDNAME><ROLLNAME>${rollname}</ROLLNAME><ADMINFIELD>0</ADMINFIELD>` +
    `<INTTYPE>C</INTTYPE><INTLEN>000020</INTLEN><DATATYPE>CHAR</DATATYPE><LENG>000010</LENG><MASK>  CHAR</MASK></DD03P>`;
}

/** field typed REF TO a class or interface */
export function refField(field: string, rollname: string, reftype: "C" | "I"): string {
  return `    <DD03P><FIELDNAME>${field}</FIELDNAME><ROLLNAME>${rollname}</ROLLNAME><ADMINFIELD>0</ADMINFIELD>` +
    `<DATATYPE>REF</DATATYPE><MASK>  REF R${reftype}</MASK><COMPTYPE>R</COMPTYPE><REFTYPE>${reftype}</REFTYPE></DD03P>`;
}

export function includeField(precfield: string, fieldname = ".INCLUDE"): string {
  return `    <DD03P><FIELDNAME>${fieldname}</FIELDNAME><ADMINFIELD>0</ADMINFIELD><PRECFIELD>${precfield}</PRECFIELD>` +
    `<MASK>      S</MASK><DDTEXT>x</DDTEXT><COMPTYPE>S</COMPTYPE></DD03P>`;
}

export function dtelXML(name: string, more = "<DATATYPE>CHAR</DATATYPE><LENG>000010</LENG>"): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>${name.toUpperCase()}</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DDTEXT>x</DDTEXT>
    ${more}
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
}

/** data element typed REF TO a class or interface */
export function dtelRefXML(name: string, domname: string, reftype: "C" | "I"): string {
  return dtelXML(name, `<DOMNAME>${domname}</DOMNAME><DATATYPE>REF</DATATYPE><REFKIND>R</REFKIND><REFTYPE>${reftype}</REFTYPE>`);
}

export function ttypXML(name: string, rowtype: string, rowkind: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>${name.toUpperCase()}</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>${rowtype}</ROWTYPE>
    <ROWKIND>${rowkind}</ROWKIND>
    <DATATYPE>${rowkind === "R" ? "REF" : "STRU"}</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>x</DDTEXT>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;
}

/** renames in sequence, like abaplint --rename does, returns the contents of the files afterwards by filename */
export function renameAll(files: [string, string][], renames: [string, string, string][]): {[filename: string]: string} {
  const reg = new Registry().addFiles(files.map(([name, raw]) => new MemoryFile(name, raw))).parse();
  const renamer = new Renamer(reg);
  for (const [type, oldName, newName] of renames) {
    renamer.rename(type, oldName, newName);
  }
  const result: {[filename: string]: string} = {};
  for (const f of reg.getFiles()) {
    result[f.getFilename()] = f.getRaw();
  }
  return result;
}

/** the values of the given XML tag, eg. all ROLLNAMEs */
export function tagValues(raw: string | undefined, tag: string): string[] {
  const ret: string[] = [];
  const regex = new RegExp("<" + tag + ">([^<]*)</" + tag + ">", "g");
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw || "")) !== null) {
    ret.push(m[1]);
  }
  return ret;
}
