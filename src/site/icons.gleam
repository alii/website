//// react-icons, one function each. The class is the only prop the site uses.

import react.{type Element}

@external(javascript, "./icons_ffi.ts", "vscWarning")
pub fn vsc_warning(class: String) -> Element

@external(javascript, "./icons_ffi.ts", "vscInfo")
pub fn vsc_info(class: String) -> Element

@external(javascript, "./icons_ffi.ts", "vscCheck")
pub fn vsc_check(class: String) -> Element

@external(javascript, "./icons_ffi.ts", "tbBrandTypescript")
pub fn tb_brand_typescript(class: String) -> Element

@external(javascript, "./icons_ffi.ts", "riJavascriptFill")
pub fn ri_javascript_fill(class: String) -> Element

@external(javascript, "./icons_ffi.ts", "tbBrandHtml5")
pub fn tb_brand_html5(class: String) -> Element

@external(javascript, "./icons_ffi.ts", "tbBrandCss3")
pub fn tb_brand_css3(class: String) -> Element

@external(javascript, "./icons_ffi.ts", "siGleam")
pub fn si_gleam(class: String) -> Element
