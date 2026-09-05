import api.{type Request, type Response}
import gleam/http
import gleam/javascript/promise.{type Promise}
import gleam/option.{None, Some}
import site/apple_maps
import site/constants
import site/lanyard

pub fn handle(request: Request) -> Promise(Response) {
  use <- api.only(request, http.Get)
  use presence <- promise.map(lanyard.get(constants.discord_id))
  let location = option.then(presence, lanyard.location)
  let theme = case api.query(request, "theme") {
    Some("light") -> Ok(apple_maps.Light)
    Some("dark") -> Ok(apple_maps.Dark)
    _ -> Error(Nil)
  }
  case location, theme {
    None, _ -> api.error(404, "No location found")
    _, Error(Nil) -> api.error(400, "theme must be light or dark")
    Some(location), Ok(theme) ->
      api.redirect(apple_maps.snapshot_url(location, theme))
  }
}
