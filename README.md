A note on Heroku conventions:

- Set the Heroku Name to APP_NAME-tidy-games
- Set The Dyno's Config Vars APP_NAME to match the folder name in /apps
- The Procfile runs /apps/$APP_NAME/src/index-server.ts (after typescript compilation)
