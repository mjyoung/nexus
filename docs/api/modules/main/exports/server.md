# `import { server }`

[issues](https://nxs.li/issues/component/server) / [features](https://nxs.li/issues/components/server/features) | [bugs](https://nxs.li/issues/component/server/bugs)

Use the server to run the HTTP server that clients will connect to.

### `express`

Gives you access to the underlying `express` instance.

Use this to add middlewares or expose additional REST endpoints if needed.

##### Example of using middlewares

```ts
import cors from 'cors'
import { server } from 'nexus'

server.express.use(cors())
```
