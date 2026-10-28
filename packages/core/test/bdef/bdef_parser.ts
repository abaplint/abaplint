import {expect} from "chai";
import {BDEFParser} from "../../src/bdef/bdef_parser";
import {ExpressionNode} from "../../src/abap/nodes";
import {MemoryFile} from "../../src/files/memory_file";

function parse(bdef: string) {
  const file = new MemoryFile("zfoo.bdef.asbdef", bdef);
  return new BDEFParser().parse(file);
}

describe("BDEF Parser", () => {

  const valid: {name: string, bdef: string}[] = [
    {name: "minimal managed", bdef: `managed implementation in class zbp_travel unique;
define behavior for ZI_Travel
{
}`},
    {name: "unmanaged with comments", bdef: `unmanaged implementation in class /cc4a/bp_test unique;
strict ( 2 );

define behavior for /CC4A/TEST_RAP_UNAMANAGED //alias <alias_name>
//late numbering
lock master
authorization master ( instance )
//etag master <field_name>
{
  create;
  update;
  delete;
}`},
    {name: "managed with draft", bdef: `managed implementation in class /dmo/fsa_bp_r_roottp unique;
strict ( 2 );
with draft;

define behavior for /DMO/FSA_R_RootTP alias Root
persistent table /dmo/fsa_root_a
draft table /dmo/fsa_root_d
lock master
total etag LastChangedAt
authorization master ( instance )
etag master LocalLastChangedAt
{
  create { default function GetDefaultsForCreate; }
  update (features : instance);
  delete (features : instance);

  draft determine action Prepare { validation validateTimezone; validation Child ~ validatePercentage; }
  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;

  field ( readonly, numbering : managed ) ID;
  field ( mandatory : create, readonly : update ) StringProperty;

  internal action calcTotalPieces;
  action ( features : instance ) overwriteTimezone deep parameter /DMO/FSA_D_OverwriteTimezoneP;
  factory action (features : instance) copyInstance [1];
  action ( features : instance ) changeProgress parameter /DMO/FSA_D_ChangeProgressP result [1] $self;

  determination setTime on modify { field SAPTimezone, Timestamp; }
  validation validateValidTo on save { create; update; field ValidTo; }
  determine action updateTimes { determination ( always ) updateTimesChildCreated; }

  association _Child { create { default function GetDefaultsForChild external 'GetDefaultsForCreateByAssociation'; } with draft; }

  side effects {
    field IntegerValue affects field ProgressIntegerValue, field RadialIntegerValue;
    field ChildPieces affects field _Root.TotalPieces;
    action resetTimesChildCreated affects field TimesChildCreated, permissions ( action resetTimesChildCreated );
    determine action validateDate executed on field ValidTo affects messages;
    $self affects permissions ( update _Child );
  }

  mapping for /dmo/fsa_root_a corresponding {
    ContactID = contact_id;
    CreatedAt = created_at;
  }
}

define behavior for /DMO/FSA_R_ChildTP alias Child
persistent table /dmo/fsa_child_a
draft table /dmo/fsa_child_d
lock dependent by _Root
authorization dependent by _Root
{
  update;
  delete;
  association _Root { with draft; }
}`},
    {name: "projection", bdef: `projection implementation in class ZBP_ACB_C_LABEL_S unique;
strict;
use draft;
use side effects;

define behavior for ZACB_C_Label_S alias LabelAll
use etag
{
  use create;
  use update( augment );
  use action Edit;
  use action Activate as ActivateIt external 'activate';
  use association _Label { create ( augment ); with draft; }
}`},
    {name: "abstract with hierarchy", bdef: `abstract;
strict ( 2 );
with hierarchy;

define behavior for ZD_ORDER alias Order with control
{
  association _Items with hierarchy;
}

define behavior for ZD_ITEM alias Item with control
{
}`},
    {name: "interface", bdef: `interface;
use draft;

define behavior for ZI_TRAVEL_INT alias Travel
{
  use create;
  use action accept;
  use function getStatus result entity ZI_STATUS;
  use event orderCreated deep parameter ZD_EVENT;
  use association _Booking { create; with draft; }
}`},
    {name: "extension", bdef: `extension using interface zi_travel_int implementation in class zbp_x_travel unique;

extend behavior for Travel
{
  extend draft determine action Prepare { validation zz_validateField; }
  validation zz_validateField on save { field zz_field; }
}`},
    {name: "authorization contexts", bdef: `managed implementation in class zbp_travel unique;
strict ( 2 );
with privileged mode disabling NoCheckWhenPrivileged;

define authorization context NoCheckWhenPrivileged
{
  'S_TABU_NAM';
}

define own authorization context by privileged mode;

define behavior for ZI_Travel alias Travel
lock master
authorization master ( global, instance )
{
}`},
    {name: "events and changedocuments", bdef: `managed with additional save implementation in class zbp_travel unique;
strict ( 2 );
auxiliary class zcl_travel_aux;

define behavior for ZI_Travel alias Travel
persistent table ztravel
lock master
authorization master ( global )
changedocuments master utc ( ZTRAVEL_CD )
{
  event StatusUpdated for side effects;
  event TravelCreated parameter ZD_TRAVEL_EVENT;
  changedocuments ( create : data, update : data, delete : key );
  define pure key AlternativeKey { id; }
  key ( AlternativeKey ) function GetByAltKey;
  save ( finalize ) action save_finalize;
  side effects {
    event StatusUpdated affects field ( Status, Notes ), permissions ( action Edit, update, delete );
    field Description affects field *, field _Item.*;
  }
}`},
    {name: "pragmas", bdef: `managed implementation in class zbp_travel unique;
define behavior for ZI_Travel alias Travel ##UNMAPPED_FIELD[SingletonID]
lock master
{
  validation validateUser on save ##NOT_ASSIGNED_TO_DETACT { field UserId; create; }
}`},
    {name: "old syntax", bdef: `implementation unmanaged;
define behavior for /DMO/I_Travel_U alias travel
implementation in class /dmo/bp_travel_u unique
etag LastChangedAt
lock master
{
  field ( read only ) TravelID;
  create;
}`},
    {name: "cross BO association and hierarchy", bdef: `managed implementation in class zbp_agency unique;
strict ( 2 );
with draft;
with cross associations;

define behavior for ZR_Agency alias Agency
persistent table zagency
draft table zagency_d
lock master
total etag LastChangedAt
authorization master ( instance )
{
  association _Travel using ZR_TRAVEL \\_Agency { create; with draft; }
  association _Manager { with draft; link action linkManager; unlink action unlinkManager; }

  instance hierarchy ZI_EmployeeHN
  {
    managed reorder action changeNextSibling;
    field ( hierarchy-index ) SiblingOrderNumber;
    ascending association _Manager;
    descending association _Employee { with cascading delete; }
  }
}`},
  ];

  for (const v of valid) {
    it("valid, " + v.name, () => {
      expect(parse(v.bdef)).to.be.instanceof(ExpressionNode);
    });
  }

  const invalid: {name: string, bdef: string}[] = [
    {name: "not a behavior definition", bdef: `THIS IS NOT A BEHAVIOR DEFINITION ??? {{{`},
    {name: "empty", bdef: ``},
    {name: "missing semicolon after implementation type", bdef: `managed implementation in class zbp_travel unique
define behavior for ZI_Travel
{
}`},
    {name: "missing body", bdef: `managed implementation in class zbp_travel unique;
define behavior for ZI_Travel
lock master`},
    {name: "unbalanced braces", bdef: `managed implementation in class zbp_travel unique;
define behavior for ZI_Travel
{
  create;
`},
    {name: "missing semicolon in body", bdef: `managed implementation in class zbp_travel unique;
define behavior for ZI_Travel
{
  create
  update;
}`},
    {name: "unknown body statement", bdef: `managed implementation in class zbp_travel unique;
define behavior for ZI_Travel
{
  foo bar;
}`},
  ];

  for (const i of invalid) {
    it("invalid, " + i.name, () => {
      expect(parse(i.bdef)).to.equal(undefined);
    });
  }

});
