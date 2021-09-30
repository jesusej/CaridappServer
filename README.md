# Caridapp Server

Server implementation for Caridapp project with Express and node.js

## How to run development mode

1. Download the virtual environment (check your google drive) and place it in the base dir `...\CaridappServer`
2. Open a terminal in workspace or the VSCode integrated terminal
3. If first time, install the server dependencies with `npm install`
4. Run development mode with `npm run devStart`

## How to install/uninstall dependencies

1. Get in the base dir: `...\CaridappServer`
2. Install node packages with npm:
   - For production dependencies: `npm install <package-name>`
   - For development dependencies: `npm install -D <package-name>`
3. Add a commit with starting a `:heavy_plus_sign:` emoji
4. If you messed up or if you want to uninstall a dependencie, use `npm uninstall <package-name>`

## Remember...

- If you want to modify the DB for yourself you need to use a tool to connect to the DB. ClearDB recommends to use Graphical Tools like [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
- Only push/merge to main if you think that your implementation is ready enough. Remember to work with branches meanwhile

## Useful info/resources

- [Postman API tester](https://www.postman.com)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
- [MySQL library docs](https://www.npmjs.com/package/mysql#server-disconnects)
- [Express docs](http://expressjs.com/en/4x/api.html)
- [Gitmoji](https://gitmoji.dev)