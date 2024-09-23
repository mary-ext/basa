# basa

Google Translate/DeepL translation proxy service.

## API

API is modeled after AT Protocol's XRPC.

### `/xrpc/x.basa.describeServer`

Describes the proxy instance, returns supported language codes of each service.

### `/xrpc/x.basa.translate`

Translates a given text

- `engine`  
  Which translation service to use
  - `google` for Google Translate
  - `deepl` for DeepL
- `from` (optional, defaults to `auto`)  
  Source language code, defaults to `auto`
- `to`  
  Source language
- `text`  
  Text to translate
