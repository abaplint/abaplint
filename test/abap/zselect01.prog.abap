  REPORT zselect01.

  DATA: lv_category TYPE seoclassdf-category,
        lv_proxy    TYPE seoclassdf-clsproxy.

  SELECT SINGLE category clsproxy FROM seoclassdf
    INTO (lv_category, lv_proxy).