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
