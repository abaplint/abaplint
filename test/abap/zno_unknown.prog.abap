REPORT zno_unknown.

WRITE 'foobar'.
WRITE: 'foobar'.
WRITE: 'foobar', 'bar'.

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