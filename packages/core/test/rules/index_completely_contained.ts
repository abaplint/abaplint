import {expect} from "chai";
import {IndexCompletelyContained} from "../../src/rules";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";

async function findIssues(filename: string, contents: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, contents));
  await reg.parseAsync();
  const rule = new IndexCompletelyContained();
  return rule.run(reg.getFirstObject()!);
}

describe("Rule: index_completely_contained", () => {

  it("Error, completely contained", async () => {
    const issues = await findIssues("zindexcomplete.tabl.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZINDEXCOMPLETE</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>completely contained</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZINDEXCOMPLETE</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD2</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD3</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
   <DD12V>
    <DD12V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z10</INDEXNAME>
     <AS4LOCAL>A</AS4LOCAL>
     <DDLANGUAGE>E</DDLANGUAGE>
     <DDTEXT>FIELD2</DDTEXT>
    </DD12V>
    <DD12V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z20</INDEXNAME>
     <AS4LOCAL>A</AS4LOCAL>
     <DDLANGUAGE>E</DDLANGUAGE>
     <DDTEXT>FIELD2 + FIELD3</DDTEXT>
    </DD12V>
   </DD12V>
   <DD17V>
    <DD17V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z10</INDEXNAME>
     <POSITION>0001</POSITION>
     <AS4LOCAL>A</AS4LOCAL>
     <FIELDNAME>FIELD2</FIELDNAME>
    </DD17V>
    <DD17V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z20</INDEXNAME>
     <POSITION>0001</POSITION>
     <AS4LOCAL>A</AS4LOCAL>
     <FIELDNAME>FIELD2</FIELDNAME>
    </DD17V>
    <DD17V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z20</INDEXNAME>
     <POSITION>0002</POSITION>
     <AS4LOCAL>A</AS4LOCAL>
     <FIELDNAME>FIELD3</FIELDNAME>
    </DD17V>
   </DD17V>
  </asx:values>
 </asx:abap>
</abapGit>`);
    expect(issues.length).to.equal(1);
  });

  it("Fixed", async () => {
    const issues = await findIssues("zindexcomplete.tabl.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZINDEXCOMPLETE</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>completely contained</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZINDEXCOMPLETE</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD2</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD3</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
   <DD12V>
    <DD12V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z20</INDEXNAME>
     <AS4LOCAL>A</AS4LOCAL>
     <DDLANGUAGE>E</DDLANGUAGE>
     <DDTEXT>FIELD2 + FIELD3</DDTEXT>
    </DD12V>
   </DD12V>
   <DD17V>
    <DD17V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z20</INDEXNAME>
     <POSITION>0001</POSITION>
     <AS4LOCAL>A</AS4LOCAL>
     <FIELDNAME>FIELD2</FIELDNAME>
    </DD17V>
    <DD17V>
     <SQLTAB>ZINDEXCOMPLETE</SQLTAB>
     <INDEXNAME>Z20</INDEXNAME>
     <POSITION>0002</POSITION>
     <AS4LOCAL>A</AS4LOCAL>
     <FIELDNAME>FIELD3</FIELDNAME>
    </DD17V>
   </DD17V>
  </asx:values>
 </asx:abap>
</abapGit>`);
    expect(issues.length).to.equal(0);
  });

});
