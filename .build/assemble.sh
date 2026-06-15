#!/bin/bash
set -e
cd "$(dirname "$0")/.."
{
  cat .build/top.html
  printf '\n<script>\n'; cat .build/d3-array.min.js;       printf '\n</script>\n'
  printf '<script>\n';   cat .build/d3-geo.min.js;         printf '\n</script>\n'
  printf '<script>\n';   cat .build/topojson-client.min.js; printf '\n</script>\n'
  printf '<script>var COUNTRIES_TOPO='; cat .build/countries-110m.json; printf ';</script>\n'
  printf '<script>var EARTH_TEX="data:image/jpeg;base64,'; cat .build/earth.b64; printf '";</script>\n'
  printf '<script>var CLOUDS_TEX="data:image/png;base64,'; cat .build/clouds.b64; printf '";</script>\n'
  printf '<script>var FONT_DATA="data:font/woff2;base64,'; cat .build/font.b64; printf '";</script>\n'
  printf '<script>\n';   cat .build/game.js;               printf '\n</script>\n'
  printf '</body>\n</html>\n'
} > index.html
echo "built index.html ($(wc -c < index.html) bytes)"
