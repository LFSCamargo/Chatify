# Chatify

Welcome to Chatify a simple chat application that uses React Native and GraphQL

<img src="https://cdn-images-1.medium.com/max/1600/1*pD7ShcZ7YHIMXe2mgiFzbg.png">

# Welcome to Chatify a simple chat application that uses React Native and GraphQL

The idea for this open source project is to show how we can use GraphQL Subscriptions to deal with Real time updates. And also to show people that WebRTC its not a Monster.

Also im preparing a blog Post to show you guys the processes and the troubles that i passed through.

# How to run the app

1. First install the dependencies `yarn install`
2. Copy the env file to .env `yarn server:config:local`
3. Run the server `yarn server:dev`
4. Start packager `yarn app:start`
5. Run on ios or android `yarn app:ios` or `yarn app:android`

### PS: You need to have mongo installed on your machine

### PPS: Android device or AVD must be running so reat native will be able to find the device to deal with the installation

# To test the video calls you need two devices and ngrok to expose the server to the devices!

## PPS: Run the server and the packager before all those steps above

1. run this command `ngrok http 5000` to expose the port to the device will appear something like this

```
Session Status                online
Session Expires               7 hours, 47 minutes
Version                       2.3.29
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://7963e9cd.ngrok.io -> http://localhost:5000
Forwarding                    https://7963e9cd.ngrok.io -> http://localhost:5000
```

2. Copy the fowarding without the `http://` like this `7963e9cd.ngrok.io` and replace on the `config.ts`:

```
export const GRAPHQL_URI = 'http://something.ngrok.io/graphql'
export const SUBSCRIPTIONS_URI = 'ws://something.ngrok.io/graphql'
```

3. Build on the device using XCode

4. And test the video calls ❤️

# Main Libraries Used to do the dirty job

## Backend:

- GraphQL
- Mongoose
- Jest
- Apollo Server
- GraphQL Tag

## Front End:

- React Native
- React Native WebRTC
- React Apollo
- React
- Jest
- React Apollo Hooks

# Mentions:

<table>
   <tr>
      <td align="center">
         <a href="https://github.com/sibelius">
         <img src="https://avatars0.githubusercontent.com/u/2005841?s=460&v=4" width="100px;" alt="Sibelius"/>
         <br />
         <sub>
         <b>Sibelius Seraphini</b>
         </esub>
         </a>
      </td>
      <td align="center">
         <a href="https://github.com/jgcmarins">
         <img src="https://avatars1.githubusercontent.com/u/5133450?s=460&v=4" width="100px;" alt="Joao"/>
         <br />
         <sub>
         <b>Joao Marins</b>
         </esub>
         </a>
      </td>
      <td align="center">
         <a href="https://github.com/jaburcodes">
         <img src="https://avatars1.githubusercontent.com/u/13947203?s=460&v=4" width="100px;" alt="Jabur"/>
         <br />
         <sub>
         <b>Guilherme Jabur</b>
         </esub>
         </a>
      </td>
      <td align="center">
         <a href="https://github.com/Thomazella">
         <img src="https://avatars0.githubusercontent.com/u/15015324?s=460&v=4" width="100px;" alt="Thom"/>
         <br />
         <sub>
         <b>Raphael Thomazella</b>
         </esub>
         </a>
      </td> 
   </tr>
</table>
