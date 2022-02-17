#1  first of all, install 'Node.js LTS' and 'NPM'

#2  change directory to 'VoiceCall App'

#3  Run 'npm install' in terminal

###########################################

#   IMPORTANT TIP:

    Because WebRTC MUST run over HTTPS, and this project is run over HTTP,
    you should add your host URL as trusted for the browsers.
    to do this, go to the below url and do the tips provided
    in the video beside the application.
    Do this tutorial on all browsers you want to use.
    Remind that you should add the host URL and its port to the box in the video

    - chrome and android-chrome browser: 
        chrome://flags/#unsafely-treat-insecure-origin-as-secure
    - opera browser: 
        opera://flags/#unsafely-treat-insecure-origin-as-secure

###########################################

#4  Run the server with command 'node app.js'
    if you want to run the server on your desired port, change it on constants.json file,
    or run the server with command 'node app.js $port'
    example: node app.js 4000

#5  Admin URL: http://$ip:$port/admin/$adminName/$roomId
    example: http://localhost:3000/admin/Alireza/room_1

#5  Client URL: http://$ip:$port/client/$clientName/$roomId
    example: http://localhost:3000/client/Mersad/room_1