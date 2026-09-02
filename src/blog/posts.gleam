import blog/ambient_declarations
import blog/esm
import blog/gleam_bun_apps
import blog/mochip
import blog/open_source
import blog/post.{type Post}
import blog/railways
import blog/serverless_discord_oauth
import blog/strict_tsconfig
import blog/zero_kb_blog

pub fn all() -> List(Post) {
  [
    railways.post(),
    gleam_bun_apps.post(),
    ambient_declarations.post(),
    esm.post(),
    open_source.post(),
    mochip.post(),
    zero_kb_blog.post(),
    serverless_discord_oauth.post(),
    strict_tsconfig.post(),
  ]
}
