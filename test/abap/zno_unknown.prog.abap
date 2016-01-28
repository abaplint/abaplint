REPORT zno_unknown.

* write
WRITE 'foobar'.
WRITE: 'foobar'.
WRITE: 'foobar', 'bar'.

* direct call method
cl_gui_cfw=>flush( ).
cl_gui_cfw=>flush( ) .

* move
lt_foo[] = lt_bar[].

* data
DATA lv_foo TYPE i.
DATA lv_foo LIKE LINE OF foo.
DATA lv_foo LIKE lv_foo.
DATA lv_foo TYPE REF TO cl_foobar.
DATA lv_foo TYPE TABLE OF i.
DATA lv_foo TYPE zcl_class=>typedef.
DATA lv_foo LIKE sy-tabix.
data foo type ref to ZCL_FOOBAR.
data foo type ref to ZCL_FOOBAR .
DATA sdf TYPE c ##NEEDED.
Data foo(89) type c.
data foo type char100.
data foo100 type c length 100.
data char.
data char(100).
data sdf type table of ref to zcl_foobar.
data range type range of string.
data: lt_foo type table of bar initial size 0.
data foobar type abap_bool read-only value ABAP_FALSE ##NO_TEXT.
data item(4) value '  # '.

* append
append 'sdf' to lt_foo.
APPEND INITIAL LINE TO lt_lines ASSIGNING <ls_line>.
APPEND LINES OF lt_objects TO gt_programs.
APPEND is_definition-definition TO ls_obj_old-wdyd-defin.
APPEND <ls_component> TO ls_obj_old-wdyc-ccomp.
* APPEND <ls_node>-obj_name TO lt_findstrings.
* APPEND LINES OF read_text_online( ) TO rt_repos.
* APPEND read_controller( ls_controller_key ) TO rs_component-ctlr_metadata.

* misc
condense lv_foo.
add 2 to lv_foo.
continue.
rollback work.
clear lv_foo.
assert 1 = 0.
concatenate space space into lv_foo.
while 1 = 2.
endwhile.
if 1 = 2.
elseif 2 = 3.
else.
endif.
include zinclude.
parameters: p_foo type c.
read table lt_foo index 1 into ls_foo.
tables usr02.
translate lv_foo to upper case.
unassign <ls_foo>.
case lv_foo.
    when 'foo'.
    when others.
endcase.
break-point.
do 2 times.
enddo.
describe lt_foo lines lv_lines.
free lt_foo.
leave to screen 0.
assign component 'asdf' of ls_foo to <foobar>.
at first.
try.
catch zcx_root.
endtry.
SCAN ABAP-SOURCE tab1 TOKENS INTO tab2 STATEMENTS INTO tab3.
shift lv_foo by 2 places left.
update asdf from foo.
types: foo type c.
class lcl_foo definition.
endclass.
class lcl_foo implementation.
method foo.
endmethod.
endclass.
check 1 = 2.
commit work.
rollback work.
constants: lv_foo type c value 'a'.
OPEN DATASET foobar FOR OUTPUT.
TRANSFER 'sfd' TO foobar.
submit zfoobar and return.
split lv_foo at space into table lt_foobar.
set bit 2 of lv_foo.
raise exception type zcx_root.
message 'sdf' type 'S'.
FIND FIRST OCCURRENCE OF 'boo' in lv_foo MATCH OFFSET lv_offset.