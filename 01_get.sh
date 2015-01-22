cookies="$(cat .cookies)"

fetch_page() {
  http --form POST http://www.italki.com/teachers/professional \
    teach=english availability=9 within=-1 speak=all country="" price="" \
    native=0 has-free-trial=0 has-video=0 page="$1" ajax=1 \
    "Accept-Language:en-US,en;q=0.8" \
    "Cache-Control:no-cache" \
    "Cookie: $cookies" \
    "Origin:http://www.italki.com" \
    "Pragma:no-cache" \
    "Referer:http://www.italki.com/teachers/professional" \
    "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Safari/537.36" \
    "X-Requested-With:XMLHttpRequest" > "./pages/$1.json"
}

page=1
while true; do
  fetch_page $page
  has_next=$(cat "./pages/$page.json" | json has_next)
  if [[ "x$has_next" != "xtrue" ]]; then
    break
  fi
  page=$((page+1))
done

