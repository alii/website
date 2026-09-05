import react.{type Attribute, type Element}

pub fn svg(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("svg", attrs, children)
}

pub fn defs(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("defs", attrs, children)
}

pub fn marker(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("marker", attrs, children)
}

pub fn path(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("path", attrs, children)
}

pub fn rect(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("rect", attrs, children)
}

pub fn text(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("text", attrs, children)
}

pub fn g(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("g", attrs, children)
}

pub fn line(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("line", attrs, children)
}

pub fn circle(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("circle", attrs, children)
}

pub fn ellipse(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("ellipse", attrs, children)
}

pub fn title(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("title", attrs, children)
}

pub fn mpath(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("mpath", attrs, children)
}

pub fn linear_gradient(
  attrs: List(Attribute),
  children: List(Element),
) -> Element {
  react.element("linearGradient", attrs, children)
}

pub fn stop(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("stop", attrs, children)
}

pub fn animate(attrs: List(Attribute), children: List(Element)) -> Element {
  react.element("animate", attrs, children)
}

pub fn animate_motion(
  attrs: List(Attribute),
  children: List(Element),
) -> Element {
  react.element("animateMotion", attrs, children)
}
