# Architecture

Extension (MV3) -> Backend -> Reddit Data API

Why backend?
- OAuth client secret cannot be stored safely in a browser extension
- Centralized rate limiting + caching
- Easier compliance + monitoring
