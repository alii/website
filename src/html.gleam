import react.{type Attribute, type Element}

pub fn text(text: String) -> Element {
  react.text(text)
}

pub fn div(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("div", attrs, children)
}

pub fn main(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("main", attrs, children)
}

pub fn footer(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("footer", attrs, children)
}

pub fn h1(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("h1", attrs, children)
}

pub fn p(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("p", attrs, children)
}

pub fn span(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("span", attrs, children)
}

pub fn a(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("a", attrs, children)
}

pub fn h2(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("h2", attrs, children)
}

pub fn section(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("section", attrs, children)
}

pub fn ol(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("ol", attrs, children)
}

pub fn li(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("li", attrs, children)
}

pub fn article(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("article", attrs, children)
}

pub fn header(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("header", attrs, children)
}

pub fn pre(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("pre", attrs, children)
}

pub fn hr(attrs: List(Attribute)) -> Element {
  react.element("hr", attrs, [])
}

pub fn img(attrs: List(Attribute)) -> Element {
  react.element("img", attrs, [])
}

pub fn title(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("title", attrs, children)
}

pub fn meta(attrs: List(Attribute)) -> Element {
  react.element("meta", attrs, [])
}

pub fn link(attrs: List(Attribute)) -> Element {
  react.element("link", attrs, [])
}

pub fn script(attrs: List(Attribute)) -> Element {
  react.element("script", attrs, [])
}

pub fn body(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("body", attrs, children)
}

pub fn code(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("code", attrs, children)
}

pub fn b(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("b", attrs, children)
}

pub fn em(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("em", attrs, children)
}

pub fn i(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("i", attrs, children)
}

pub fn h3(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("h3", attrs, children)
}

pub fn ul(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("ul", attrs, children)
}

pub fn td(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("td", attrs, children)
}

pub fn g(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("g", attrs, children)
}

pub fn strong(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("strong", attrs, children)
}

pub fn tr(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("tr", attrs, children)
}

pub fn th(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("th", attrs, children)
}

pub fn blockquote(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("blockquote", attrs, children)
}

pub fn ellipse(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("ellipse", attrs, children)
}

pub fn video(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("video", attrs, children)
}

pub fn u(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("u", attrs, children)
}

pub fn thead(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("thead", attrs, children)
}

pub fn tbody(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("tbody", attrs, children)
}

pub fn table(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("table", attrs, children)
}

pub fn svg(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("svg", attrs, children)
}

pub fn small(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("small", attrs, children)
}

pub fn path(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("path", attrs, children)
}

pub fn figure(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("figure", attrs, children)
}

pub fn br(attrs: List(Attribute)) -> Element {
  react.element("br", attrs, [])
}
