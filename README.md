# Contentful-Game-Platform-Config

- A custom Contentful app used in the Game model to configure platform specific data.

## Useful links

More details around why this app is used can be found [here](https://confluence.gamesys.co.uk/display/UWS/Contentful+Conditional+Fields+Application)


[Custom Contentful Apps - Implementation Guide](https://confluence.gamesys.co.uk/display/SPS/Custom+Contentful+Apps+-+Implementation+Guide)

## Deployment

1. run `npm run build`
2. run `npm run deploy`
3. ensure the app in contentful uses this link: `https://github.gamesys.co.uk/pages/PlayerServices/contentful-game-platform-config/`

When all the changes have been merged into master run the deploy script.
The changes made to the app will not immediately be available in Contentful (normally for up to 10 minutes).
